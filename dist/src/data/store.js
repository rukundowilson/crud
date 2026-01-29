"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.addCategory = addCategory;
exports.getProducts = getProducts;
exports.addProduct = addProduct;
exports.getCart = getCart;
exports.saveCart = saveCart;
const mongoConfig_1 = require("./mongoConfig");
// Helper to get collections
async function getCollection(name) {
    const db = await (0, mongoConfig_1.connectMongo)();
    return db.collection(name);
}
// Categories
async function getCategories() {
    const col = await getCollection("categories");
    return col.find().toArray();
}
async function addCategory(category) {
    const col = await getCollection("categories");
    return col.insertOne(category);
}
// Products
async function getProducts() {
    const col = await getCollection("products");
    return col.find().toArray();
}
async function addProduct(product) {
    const col = await getCollection("products");
    return col.insertOne(product);
}
// Carts
async function getCart(userId) {
    const col = await getCollection("carts");
    return col.findOne({ userId });
}
async function saveCart(cart) {
    const col = await getCollection("carts");
    return col.updateOne({ userId: cart.userId }, { $set: cart }, { upsert: true });
}
