"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.verifyPassword = verifyPassword;
const mongoConfig_1 = require("./mongoConfig");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Users collection operations
async function getUser(email) {
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("users");
    return col.findOne({ email });
}
async function getUserById(id) {
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("users");
    return col.findOne({ id });
}
async function createUser(user) {
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("users");
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(user.password, 10);
    user.password = hashedPassword;
    await col.insertOne(user);
}
async function verifyPassword(plainPassword, hashedPassword) {
    return bcryptjs_1.default.compare(plainPassword, hashedPassword);
}
