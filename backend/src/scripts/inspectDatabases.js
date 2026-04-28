// Read-only inspection. Connects to the Atlas cluster (admin), lists every database,
// and for each one lists its collections + document counts. Use this to decide which
// DB is the real one before dropping the other.
//
// Run from backend/: node src/scripts/inspectDatabases.js

import mongoose from "mongoose";
import dotenvSafe from "dotenv-safe";

dotenvSafe.config({ example: ".env.example" });

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    const adminDb = mongoose.connection.db.admin();

    console.log(`Connection host: ${mongoose.connection.host}`);
    console.log(`Default DB from URI: ${mongoose.connection.name}\n`);

    const { databases } = await adminDb.listDatabases();
    console.log(`Databases on this cluster: ${databases.map(d => d.name).join(", ")}\n`);

    for (const dbInfo of databases) {
        if (["admin", "local", "config"].includes(dbInfo.name)) continue;

        const db = mongoose.connection.client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();

        const sizeMB = (dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2);
        console.log(`━━━ ${dbInfo.name} (${sizeMB} MB on disk) ━━━`);
        if (collections.length === 0) {
            console.log(`  (empty — no collections)\n`);
            continue;
        }
        for (const coll of collections) {
            try {
                const count = await db.collection(coll.name).countDocuments();
                console.log(`  ${coll.name.padEnd(20)} ${count} docs`);
            } catch (err) {
                console.log(`  ${coll.name.padEnd(20)} (error: ${err.message})`);
            }
        }
        console.log();
    }

    await mongoose.disconnect();
}

main().catch(err => {
    console.error("Inspect failed:", err);
    process.exit(1);
});
