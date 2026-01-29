import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getCategories, addCategory } from "../data/store";
import { Category } from "../types";
import { connectMongo } from "../data/mongoConfig";

export interface AuthRequest extends Request {
  userRole?: string;
  file?: Express.Multer.File;
}

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of all categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await getCategories();
  res.json(categories);
};

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: "Category not found" });
  res.json(cat);
};

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create category (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Name is required
 *       403:
 *         description: Admin access required
 */
export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body as Partial<Category>;
  if (!name) return res.status(400).json({ message: "Name is required" });
  
  const newCat: Category = { 
    id: uuid(), 
    name, 
    description,
    image: req.file?.path // Cloudinary returns path with secure URL
  };
  
  await addCategory(newCat);
  res.status(201).json(newCat);
};

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *       403:
 *         description: Admin access required
 */
export const updateCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body as Partial<Category>;
  const db = await connectMongo();
  const col = db.collection<Category>("categories");
  const category = await col.findOne({ id });
  if (!category) return res.status(404).json({ message: "Category not found" });
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (req.file?.path) category.image = req.file.path;
  await col.updateOne({ id }, { $set: category });
  res.json(category);
};

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete category and all its products (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category and associated products deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedProducts:
 *                   type: number
 *       404:
 *         description: Category not found
 *       403:
 *         description: Admin access required
 */
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = await connectMongo();
  
  // Delete the category
  const categoriesCol = db.collection<Category>("categories");
  const categoryResult = await categoriesCol.deleteOne({ id });
  
  if (categoryResult.deletedCount === 0) {
    return res.status(404).json({ message: "Category not found" });
  }
  
  // Delete all products associated with this category
  const productsCol = db.collection("products");
  const productsResult = await productsCol.deleteMany({ categoryId: id });
  
  res.status(200).json({
    message: "Category and associated products deleted successfully",
    deletedProducts: productsResult.deletedCount
  });
};
