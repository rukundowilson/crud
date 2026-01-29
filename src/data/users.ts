import { User } from "../types";
import { connectMongo } from "./mongoConfig";
import bcrypt from "bcryptjs";

// Users collection operations
export async function getUser(email: string): Promise<User | null> {
  const db = await connectMongo();
  const col = db.collection<User>("users");
  return col.findOne({ email });
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await connectMongo();
  const col = db.collection<User>("users");
  return col.findOne({ id });
}

export async function createUser(user: User): Promise<void> {
  const db = await connectMongo();
  const col = db.collection<User>("users");
  
  // Hash password
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  
  await col.insertOne(user);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
