import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { withTimeout } from "../lib/externalCall.js";

// Per-call timeout: Gemini's free tier targets 1-3s response times for simple
// prompts; long transcripts can take 10-15s. 30s timeout protects against
// upstream stalls (model overload, network issues) while leaving headroom for
// legitimate slow responses. On timeout, the controller's central error
// middleware converts the EXTERNAL_TIMEOUT to a 504 response.
const GEMINI_TIMEOUT_MS = 30000;

// Initialize Gemini LLM (free tier available at ai.google.dev)
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-lite",
    temperature: 0.3,
    maxOutputTokens: 2000,
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
});

// --- Prompt Templates ---

const SUMMARIZE_PROMPT = `You are an assistant that summarizes chat conversations. Given the transcript below, provide a concise, structured summary.

Format your response as PLAIN TEXT only. Do NOT use markdown, asterisks, bold, or any special formatting characters. Use simple labels followed by colons, and start each point on a new line with a dash.

Structure:
Key Topics:
- topic 1
- topic 2

Decisions Made:
- decision 1

Unresolved Questions:
- question 1

Notable Mentions:
- any important names, dates, links, or numbers

Be concise — aim for 150-300 words depending on conversation length.`;

const QA_PROMPT = `You are an assistant that answers questions about a chat conversation. Use ONLY information from the provided transcript. If the answer is not in the transcript, say "I couldn't find that in the conversation."

Format your response as PLAIN TEXT only. Do NOT use markdown, asterisks, bold, or any special formatting. Be specific and quote relevant parts of the conversation when helpful. Keep your answer concise.`;

const ACTION_ITEMS_PROMPT = `You are an assistant that extracts action items from chat conversations. For each action item found, identify the task, who is responsible, and any deadline.

Return ONLY a JSON array of action items. No markdown, no extra text. If no action items are found, return an empty array [].
Example: [{"task": "Review the PR", "assignee": "Alice", "deadline": "Friday", "context": "Alice said she'd review the PR by Friday"}]`;

// --- Helpers ---

/**
 * Convert populated Message documents into a plain-text transcript
 */
function formatMessagesForLLM(messages) {
    return messages.map((msg) => {
        const timestamp = new Date(msg.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        const sender = msg.senderId?.fullName || msg.senderId?.username || "Unknown";
        const content = msg.text || (msg.image ? "[Image]" : "[Empty message]");
        return `[${timestamp}] ${sender}: ${content}`;
    }).join("\n");
}

/**
 * Rough token count estimate (~4 chars per token for English)
 */
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

/**
 * Split messages into chunks that fit within token budget,
 * summarize each chunk, then combine with recent messages for final prompt.
 */
async function chunkAndSummarize(messages, maxTranscriptTokens = 120000) {
    const transcript = formatMessagesForLLM(messages);
    const totalTokens = estimateTokens(transcript);

    // If it fits, return the transcript directly
    if (totalTokens <= maxTranscriptTokens) {
        return transcript;
    }

    // Split into chunks of ~3000 tokens each
    const chunkSize = 3000;
    const lines = transcript.split("\n");
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;

    for (const line of lines) {
        const lineTokens = estimateTokens(line);
        if (currentTokens + lineTokens > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.join("\n"));
            currentChunk = [];
            currentTokens = 0;
        }
        currentChunk.push(line);
        currentTokens += lineTokens;
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n"));
    }

    // Summarize each chunk
    const chunkSummaries = [];
    for (const chunk of chunks.slice(0, -1)) {
        const response = await withTimeout("gemini.invoke", GEMINI_TIMEOUT_MS, () => llm.invoke([
            new SystemMessage("Summarize these chat messages in 200 words, preserving key decisions, action items, and topics discussed."),
            new HumanMessage(chunk),
        ]));
        chunkSummaries.push(response.content);
    }

    // Combine: chunk summaries (historical context) + last chunk (recent messages raw)
    const lastChunk = chunks[chunks.length - 1];
    const combined = `--- Historical Context (Summarized) ---\n${chunkSummaries.join("\n\n")}\n\n--- Recent Messages ---\n${lastChunk}`;

    return combined;
}

// --- Main Functions ---

/**
 * Summarize a conversation
 * @param {Array} messages - Populated Message documents
 * @param {Object} options - { since?: Date, lastN?: number }
 * @returns {string} Summary text
 */
export async function summarizeConversation(messages, options = {}) {
    if (messages.length === 0) {
        return "No messages to summarize in the selected time range.";
    }

    const transcript = await chunkAndSummarize(messages);

    const contextInfo = options.since
        ? `\nTime range: Messages since ${new Date(options.since).toLocaleString()}`
        : `\nTotal messages: ${messages.length}`;

    const response = await withTimeout("gemini.invoke", GEMINI_TIMEOUT_MS, () => llm.invoke([
        new SystemMessage(SUMMARIZE_PROMPT),
        new HumanMessage(`${contextInfo}\n\n--- Conversation Transcript ---\n${transcript}`),
    ]));

    return response.content;
}

/**
 * Answer a question about a conversation
 * @param {Array} messages - Populated Message documents
 * @param {string} question - User's question
 * @returns {string} Answer text
 */
export async function answerQuestion(messages, question) {
    if (messages.length === 0) {
        return "There are no messages in this conversation to search through.";
    }

    const transcript = await chunkAndSummarize(messages);

    const response = await withTimeout("gemini.invoke", GEMINI_TIMEOUT_MS, () => llm.invoke([
        new SystemMessage(QA_PROMPT),
        new HumanMessage(`Question: ${question}\n\n--- Conversation Transcript ---\n${transcript}`),
    ]));

    return response.content;
}

/**
 * Extract action items from a conversation
 * @param {Array} messages - Populated Message documents
 * @returns {Array} Action items
 */
export async function extractActionItems(messages) {
    if (messages.length === 0) {
        return [];
    }

    const transcript = await chunkAndSummarize(messages);

    const response = await withTimeout("gemini.invoke", GEMINI_TIMEOUT_MS, () => llm.invoke([
        new SystemMessage(ACTION_ITEMS_PROMPT),
        new HumanMessage(`--- Conversation Transcript ---\n${transcript}`),
    ]));

    try {
        // Extract JSON from the response (handle markdown code blocks)
        let jsonStr = response.content;
        const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        return JSON.parse(jsonStr);
    } catch {
        // If parsing fails, return the raw text as a single item
        return [{ task: response.content, assignee: "N/A", deadline: "N/A", context: "Could not parse structured items" }];
    }
}
