#!/usr/bin/env node
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'crudApp';

async function migrate() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('categories');

    console.log('Finding categories with `tags` field...');
    const cursor = col.find({ tags: { $exists: true } });

    let count = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const tags = doc.tags;

      const set = {};
      if (Array.isArray(tags) && tags.length > 0) {
        // use first tag as the single category.tag value
        set.tag = String(tags[0]);
      }

      const updateOps = {};
      if (Object.keys(set).length > 0) updateOps.$set = set;
      updateOps.$unset = { tags: "" };

      const res = await col.updateOne({ _id: doc._id }, updateOps);
      if (res.modifiedCount > 0) {
        count++;
        console.log(`Updated category ${doc.name || doc.id} -> tag: ${set.tag || '<none>'}`);
      } else {
        console.log(`No change for ${doc.name || doc.id}`);
      }
    }

    console.log(`Migration finished. Documents updated: ${count}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

migrate();
