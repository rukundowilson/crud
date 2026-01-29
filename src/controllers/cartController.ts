import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getCart as getCartFromStore, saveCart, getProducts } from "../data/store";
import { CartItem, Cart } from "../types";

export const getCart = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const cart = await getCartFromStore(userId) || { userId, items: [] };
  res.json(cart);
};

export const addItem = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body as { productId: string; quantity: number };
  if (!productId || !quantity) return res.status(400).json({ message: "productId and quantity required" });
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(400).json({ message: "Product not found" });
  let cart = await getCartFromStore(userId) || { userId, items: [] };
  const item = { id: uuid(), productId, name: product.name, price: product.price, quantity };
  cart.items.push(item);
  await saveCart(cart);
  res.status(201).json(item);
};

export const updateItem = async (req: Request, res: Response) => {
  const { userId, id } = req.params;
  const { quantity } = req.body as { quantity: number };
  let cart = await getCartFromStore(userId);
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  const idx = cart.items.findIndex((it) => it.id === id);
  if (idx === -1) return res.status(404).json({ message: "Item not found" });
  if (quantity !== undefined) cart.items[idx].quantity = quantity;
  await saveCart(cart);
  res.json(cart.items[idx]);
};

export const deleteItem = async (req: Request, res: Response) => {
  const { userId, id } = req.params;
  let cart = await getCartFromStore(userId);
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  const idx = cart.items.findIndex((it) => it.id === id);
  if (idx === -1) return res.status(404).json({ message: "Item not found" });
  cart.items.splice(idx, 1);
  await saveCart(cart);
  res.status(204).send();
};

export const clearCart = async (req: Request, res: Response) => {
  const { userId } = req.params;
  let cart = await getCartFromStore(userId);
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  cart.items = [];
  await saveCart(cart);
  res.status(204).send();
};

