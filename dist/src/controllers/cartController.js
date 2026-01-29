"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.deleteItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const uuid_1 = require("uuid");
const store_1 = require("../data/store");
const getCart = async (req, res) => {
    const { userId } = req.params;
    const cart = await (0, store_1.getCart)(userId) || { userId, items: [] };
    res.json(cart);
};
exports.getCart = getCart;
const addItem = async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    if (!productId || !quantity)
        return res.status(400).json({ message: "productId and quantity required" });
    const products = await (0, store_1.getProducts)();
    const product = products.find((p) => p.id === productId);
    if (!product)
        return res.status(400).json({ message: "Product not found" });
    let cart = await (0, store_1.getCart)(userId) || { userId, items: [] };
    const item = { id: (0, uuid_1.v4)(), productId, name: product.name, price: product.price, quantity };
    cart.items.push(item);
    await (0, store_1.saveCart)(cart);
    res.status(201).json(item);
};
exports.addItem = addItem;
const updateItem = async (req, res) => {
    const { userId, id } = req.params;
    const { quantity } = req.body;
    let cart = await (0, store_1.getCart)(userId);
    if (!cart)
        return res.status(404).json({ message: "Cart not found" });
    const idx = cart.items.findIndex((it) => it.id === id);
    if (idx === -1)
        return res.status(404).json({ message: "Item not found" });
    if (quantity !== undefined)
        cart.items[idx].quantity = quantity;
    await (0, store_1.saveCart)(cart);
    res.json(cart.items[idx]);
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    const { userId, id } = req.params;
    let cart = await (0, store_1.getCart)(userId);
    if (!cart)
        return res.status(404).json({ message: "Cart not found" });
    const idx = cart.items.findIndex((it) => it.id === id);
    if (idx === -1)
        return res.status(404).json({ message: "Item not found" });
    cart.items.splice(idx, 1);
    await (0, store_1.saveCart)(cart);
    res.status(204).send();
};
exports.deleteItem = deleteItem;
const clearCart = async (req, res) => {
    const { userId } = req.params;
    let cart = await (0, store_1.getCart)(userId);
    if (!cart)
        return res.status(404).json({ message: "Cart not found" });
    cart.items = [];
    await (0, store_1.saveCart)(cart);
    res.status(204).send();
};
exports.clearCart = clearCart;
