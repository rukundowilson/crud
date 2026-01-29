
import { Category, Product, Cart } from "../types";
import { connectMongo } from "./mongoConfig";

// Helper to get collections
async function getCollection<T>(name: string): Promise<any> {
	const db = await connectMongo();
	return db.collection(name);
}

// Categories
export async function getCategories(): Promise<Category[]> {
	const col = await getCollection<Category>("categories");
	return col.find().toArray();
}
export async function addCategory(category: Category) {
	const col = await getCollection<Category>("categories");
	return col.insertOne(category);
}

// Products
export async function getProducts(): Promise<Product[]> {
	const col = await getCollection<Product>("products");
	return col.find().toArray();
}
export async function addProduct(product: Product) {
	const col = await getCollection<Product>("products");
	return col.insertOne(product);
}

// Carts
export async function getCart(userId: string): Promise<Cart | null> {
	const col = await getCollection<Cart>("carts");
	return col.findOne({ userId });
}
export async function saveCart(cart: Cart) {
	const col = await getCollection<Cart>("carts");
	return col.updateOne({ userId: cart.userId }, { $set: cart }, { upsert: true });
}
