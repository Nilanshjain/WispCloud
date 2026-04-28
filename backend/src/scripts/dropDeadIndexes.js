// One-shot ops script — drops the 14 leftover indexes identified by auditIndexes.js.
// Indexes still declared in the post-M02 schemas will be recreated by syncIndexes()
// on next backend boot.
//
// Run from backend/: node src/scripts/dropDeadIndexes.js

import mongoose from "mongoose";
import dotenvSafe from "dotenv-safe";

dotenvSafe.config({ example: ".env.example" });

const drops = [
    ["users", "createdAt_-1"],
    ["groups", "type_1"],
    ["groups", "createdAt_-1"],
    ["groupmembers", "groupId_1"],
    ["groupmembers", "userId_1"],
    ["chatinvites", "senderId_1"],
    ["chatinvites", "receiverId_1"],
    ["chatinvites", "status_1"],
    ["messages", "senderId_1"],
    ["messages", "receiverId_1"],
    ["messages", "isGroupMessage_1"],
    ["messages", "importance_1"],
    ["messages", "createdAt_-1"],
    ["messages", "receiverId_1_isGroupMessage_1_createdAt_-1"],
];

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
    console.log(`Dropping ${drops.length} leftover indexes...\n`);

    const db = mongoose.connection.db;
    let succeeded = 0;
    let failed = 0;

    for (const [collName, idxName] of drops) {
        try {
            await db.collection(collName).dropIndex(idxName);
            console.log(`  ✅ ${collName}.${idxName}`);
            succeeded++;
        } catch (err) {
            // Tolerate "index not found" — means it was already dropped (idempotent re-run safety).
            if (err.codeName === "IndexNotFound" || /index not found/i.test(err.message)) {
                console.log(`  ⏭  ${collName}.${idxName} (already gone)`);
            } else {
                console.log(`  ❌ ${collName}.${idxName} — ${err.message}`);
                failed++;
            }
        }
    }

    console.log(`\n════════════════════════════════════════`);
    console.log(`Dropped: ${succeeded}   Failed: ${failed}`);
    console.log(`Restart the backend so syncIndexes() recreates anything still in the schema (notably the partial messages hot-path index).`);
    console.log(`════════════════════════════════════════`);

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error("Drop script failed:", err);
    process.exit(1);
});
