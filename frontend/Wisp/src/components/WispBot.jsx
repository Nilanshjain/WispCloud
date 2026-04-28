import { useState } from "react";
import { Sparkles, X, Send, FileText, ListChecks, Loader2, ChevronDown } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const WispBot = ({ conversationId, conversationType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("");
  const [sinceHours, setSinceHours] = useState(24);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
      const res = await axiosInstance.post("/ai/summarize", {
        conversationId,
        conversationType,
        since,
      });
      setResponse({ type: "summary", content: res.data.summary, meta: res.data });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to generate summary";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axiosInstance.post("/ai/ask", {
        conversationId,
        conversationType,
        question: question.trim(),
      });
      setResponse({ type: "answer", content: res.data.answer, meta: res.data });
      setQuestion("");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to get answer";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionItems = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axiosInstance.post("/ai/action-items", {
        conversationId,
        conversationType,
      });
      setResponse({ type: "actionItems", content: res.data.actionItems, meta: res.data });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to extract action items";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    if (response.type === "summary" || response.type === "answer") {
      return (
        <div className="mt-3 p-3 bg-base-100 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
          {response.content}
          {response.meta?.messageCount != null && (
            <div className="mt-2 text-xs opacity-50">
              Based on {response.meta.messageCount} messages
            </div>
          )}
        </div>
      );
    }

    if (response.type === "actionItems") {
      const items = response.content;
      if (!items || items.length === 0) {
        return (
          <div className="mt-3 p-3 bg-base-100 rounded-lg text-sm opacity-70">
            No action items found in this conversation.
          </div>
        );
      }

      return (
        <div className="mt-3 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-base-100 rounded-lg text-sm">
              <div className="font-medium">{item.task}</div>
              <div className="flex gap-3 mt-1 text-xs opacity-60">
                <span>Assignee: {item.assignee}</span>
                <span>Due: {item.deadline}</span>
              </div>
              {item.context && (
                <div className="mt-1 text-xs opacity-50 italic">"{item.context}"</div>
              )}
            </div>
          ))}
          {response.meta?.messageCount != null && (
            <div className="text-xs opacity-50 px-1">
              Extracted from {response.meta.messageCount} messages
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative">
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute bottom-20 right-4 btn btn-circle btn-primary shadow-lg z-10 ${
          isOpen ? "btn-ghost border border-base-300" : ""
        }`}
        title="WispBot AI Assistant"
      >
        {isOpen ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-36 right-4 w-80 max-h-[500px] bg-base-200 border border-base-300 rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-base-300 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="font-semibold text-sm">WispBot</span>
            <span className="text-xs opacity-50 ml-auto">AI Assistant</span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Quick actions */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleSummarize}
                  disabled={isLoading}
                  className="btn btn-sm btn-outline flex-1 gap-1"
                >
                  <FileText className="size-3.5" />
                  Summarize
                </button>
                <button
                  onClick={handleActionItems}
                  disabled={isLoading}
                  className="btn btn-sm btn-outline flex-1 gap-1"
                >
                  <ListChecks className="size-3.5" />
                  Action Items
                </button>
              </div>

              {/* Time range selector for summarize */}
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-60">Look back:</span>
                <select
                  value={sinceHours}
                  onChange={(e) => setSinceHours(Number(e.target.value))}
                  className="select select-xs select-bordered flex-1"
                >
                  <option value={6}>Last 6 hours</option>
                  <option value={24}>Last 24 hours</option>
                  <option value={72}>Last 3 days</option>
                  <option value={168}>Last 7 days</option>
                  <option value={720}>Last 30 days</option>
                </select>
              </div>
            </div>

            {/* Ask a question */}
            <form onSubmit={handleAsk} className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about this conversation..."
                  className="input input-sm input-bordered flex-1"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-primary btn-circle"
                  disabled={isLoading || !question.trim()}
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </form>

            {/* Loading state */}
            {isLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm opacity-60">
                <Loader2 className="size-4 animate-spin" />
                <span>Analyzing conversation...</span>
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="mt-3 p-3 bg-error/10 text-error rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Response */}
            {!isLoading && renderResponse()}
          </div>
        </div>
      )}
    </div>
  );
};

export default WispBot;
