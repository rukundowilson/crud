"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const uuid_1 = require("uuid");
const store_1 = require("../data/store");
const mongoConfig_1 = require("../data/mongoConfig");
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
const getAllCategories = async (req, res) => {
    const categories = await (0, store_1.getCategories)();
    res.json(categories);
};
exports.getAllCategories = getAllCategories;
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
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const categories = await (0, store_1.getCategories)();
    const cat = categories.find((c) => c.id === id);
    if (!cat)
        return res.status(404).json({ message: "Category not found" });
    res.json(cat);
};
exports.getCategoryById = getCategoryById;
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
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name)
        return res.status(400).json({ message: "Name is required" });
    const newCat = {
        id: (0, uuid_1.v4)(),
        name,
        description,
        image: req.file?.path // Cloudinary returns path with secure URL
    };
    await (0, store_1.addCategory)(newCat);
    res.status(201).json(newCat);
};
exports.createCategory = createCategory;
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
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("categories");
    const category = await col.findOne({ id });
    if (!category)
        return res.status(404).json({ message: "Category not found" });
    if (name !== undefined)
        category.name = name;
    if (description !== undefined)
        category.description = description;
    if (req.file?.path)
        category.image = req.file.path;
    await col.updateOne({ id }, { $set: category });
    res.json(category);
};
exports.updateCategory = updateCategory;
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
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const db = await (0, mongoConfig_1.connectMongo)();
    // Delete the category
    const categoriesCol = db.collection("categories");
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
exports.deleteCategory = deleteCategory;
