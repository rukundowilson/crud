import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getProducts, addProduct, getCategories } from "../data/store";
import { Product } from "../types";
import { connectMongo } from "../data/mongoConfig";

export const getAllProducts = async (req: Request, res: Response) => {
  const products = await getProducts();
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const products = await getProducts();
  const p = products.find((x) => x.id === id);
  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, description, categoryId, displayTags } = req.body;
  const image = (req as any).file?.path;

  if (!name || price === undefined || !categoryId) {
    return res.status(400).json({ message: "Missing required product fields: name, price, categoryId" });
  }

  const categories = await getCategories();
  const catExists = categories.some((c) => c.id === categoryId);
  if (!catExists) return res.status(400).json({ message: "categoryId does not exist" });

  const newP: Product = {
    id: `product-${Date.now()}`,
    name,
    price: parseFloat(price),
    description: description || "",
    categoryId,
    image: image || undefined,
    displayTags: displayTags ? JSON.parse(displayTags) : [],
    inStock: true,
    quantity: 0,
  };

  const db = await connectMongo();
  const col = db.collection<Product>("products");
  await col.insertOne(newP as any);
  res.status(201).json(newP);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description, categoryId, inStock, quantity, displayTags } = req.body as Partial<Product>;
  const image = (req as any).file?.path;

  const db = await connectMongo();
  const col = db.collection<Product>("products");
  const product = await col.findOne({ id });
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (categoryId !== undefined) {
    const categories = await getCategories();
    const catExists = categories.some((c) => c.id === categoryId);
    if (!catExists) return res.status(400).json({ message: "categoryId does not exist" });
    product.categoryId = categoryId;
  }

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (description !== undefined) product.description = description;
  if (image !== undefined) product.image = image;
  if (displayTags !== undefined) product.displayTags = typeof displayTags === 'string' ? JSON.parse(displayTags) : displayTags;
  if (inStock !== undefined) product.inStock = inStock;
  if (quantity !== undefined) product.quantity = quantity;

  await col.updateOne({ id }, { $set: product });
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = await connectMongo();
  const col = db.collection<Product>("products");
  const result = await col.deleteOne({ id });
  if (result.deletedCount === 0) return res.status(404).json({ message: "Product not found" });
  res.status(204).send();
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const db = await connectMongo();
  const col = db.collection<Product>("products");
  const products = await col.find({ categoryId }).toArray();
  res.json(products);
};
