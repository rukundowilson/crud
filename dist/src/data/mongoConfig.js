"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
exports.getDb = getDb;
exports.closeMongo = closeMongo;
const mongodb_1 = require("mongodb");
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'crudApp';
let client;
let db;
async function connectMongo() {
    if (!client) {
        client = new mongodb_1.MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
    }
    return db;
}
function getDb() {
    if (!db) {
        throw new Error('MongoDB not connected. Call connectMongo() first.');
    }
    return db;
}
async function closeMongo() {
    if (client) {
        await client.close();
        client = undefined;
        db = undefined;
    }
}
