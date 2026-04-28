// One-shot ops script — connects to Mongo, dumps every collection's live indexes,
// and prints the diff against the M02-target index set. Read-only: makes no writes.
//
// Run from backend/: node src/scripts/auditIndexes.js

import mongoose from "mongoose";
import dotenvSafe from "dotenv-safe";

dotenvSafe.config({ example: ".env.example" });

// Indexes the post-M02 schema declares. Anything in the live DB outside this set
// is a leftover from the previous schema and should be dropped manually.
// Note: '_id_' is implicit in every collection — always present, never dropped.
const expected = {
    users: new Set([
        "_id_",
        "email_1",                                  // unique:true creates this
        "username_1",                               // unique:true creates this
        "providerId_1",                             // sparse:true creates this
        "fullName_text_email_text_username_text",   // text index (Mongo composes this name)
    ]),
    groups: new Set([
        "_id_",
        "createdBy_1",                              // index:true on field
        "isActive_1",
        "name_text_description_text",
    ]),
    groupmembers: new Set([
        "_id_",
        "groupId_1_userId_1",                       // unique compound
        "groupId_1_status_1",
        "userId_1_status_1",
        "groupId_1_role_1",
    ]),
    chatinvites: new Set([
        "_id_",
        "senderId_1_receiverId_1",
        "receiverId_1_status_1",
    ]),
    messages: new Set([
        "_id_",
        "senderId_1_receiverId_1_createdAt_-1",
        "receiverId_1_senderId_1_createdAt_-1",
        "receiverId_1_status_1",
        "receiverId_1_isGroupMessage_1_createdAt_-1",  // partial — we'll detect partial below
        "concepts_1",
        "entities.value_1",
        "importance_-1_createdAt_-1",
        "keywords_1",
    ]),
};

const collectionsToAudit = Object.keys(expected);

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

    const db = mongoose.connection.db;
    let totalDrops = 0;
    const dropCommands = [];

    for (const collName of collectionsToAudit) {
        let liveIndexes;
        try {
            liveIndexes = await db.collection(collName).indexes();
        } catch (err) {
            console.log(`⚠️  Collection "${collName}" does not exist yet — skip\n`);
            continue;
        }

        const liveNames = new Set(liveIndexes.map(i => i.name));
        const exp = expected[collName];

        const extras = [...liveNames].filter(n => !exp.has(n));
        const missing = [...exp].filter(n => !liveNames.has(n));

        console.log(`━━━ ${collName} ━━━`);
        console.log(`  Live  (${liveNames.size}): ${[...liveNames].sort().join(", ")}`);
        if (extras.length === 0 && missing.length === 0) {
            console.log(`  ✅ matches M02 target\n`);
            continue;
        }
        if (extras.length > 0) {
            console.log(`  🚩 EXTRAS to drop (${extras.length}): ${extras.join(", ")}`);
            for (const idx of extras) {
                dropCommands.push(`db.${collName}.dropIndex("${idx}")`);
                totalDrops++;
            }
        }
        if (missing.length > 0) {
            console.log(`  ❓ MISSING (will be created on next syncIndexes): ${missing.join(", ")}`);
        }

        // Surface partial-index info for messages — the new partial index has the same
        // name as the old non-partial one if both ever existed. Inspect partialFilterExpression.
        const messagesHotPath = liveIndexes.find(
            i => i.name === "receiverId_1_isGroupMessage_1_createdAt_-1"
        );
        if (collName === "messages" && messagesHotPath) {
            const isPartial = !!messagesHotPath.partialFilterExpression;
            console.log(`  ℹ️  hot-path index partialFilterExpression: ${
                isPartial ? JSON.stringify(messagesHotPath.partialFilterExpression) : "(none — this is the OLD non-partial version, drop and let syncIndexes recreate)"
            }`);
            if (!isPartial) {
                dropCommands.push(`db.messages.dropIndex("receiverId_1_isGroupMessage_1_createdAt_-1")`);
                totalDrops++;
            }
        }
        console.log();
    }

    console.log("════════════════════════════════════════");
    if (totalDrops === 0) {
        console.log("✅ All collections match M02 target — no manual drops needed.");
    } else {
        console.log(`🚩 ${totalDrops} index drop(s) needed. Run these in mongosh:\n`);
        for (const cmd of dropCommands) console.log("  " + cmd);
        console.log("\nAfter dropping, restart the backend so syncIndexes() recreates anything missing.");
    }
    console.log("════════════════════════════════════════");

    await mongoose.disconnect();
}

main().catch(err => {
    console.error("Audit failed:", err);
    process.exit(1);
});
