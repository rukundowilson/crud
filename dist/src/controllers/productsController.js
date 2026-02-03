"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByTag = exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const store_1 = require("../data/store");
const mongoConfig_1 = require("../data/mongoConfig");
const getAllProducts = async (req, res) => {
    const products = await (0, store_1.getProducts)();
    res.json(products);
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    const { id } = req.params;
    const products = await (0, store_1.getProducts)();
    const p = products.find((x) => x.id === id);
    if (!p)
        return res.status(404).json({ message: "Product not found" });
    res.json(p);
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    const { name, price, description, categoryId, categoryIds, displayTags, quantity, colors, sizes } = req.body;
    const files = req.files || [];
    const imagePaths = files.map((f) => f.path);
    if (!name || price === undefined || (!categoryId && !categoryIds)) {
        return res.status(400).json({ message: "Missing required product fields: name, price, and at least one categoryId or categoryIds" });
    }
    const categories = await (0, store_1.getCategories)();
    // Validate single categoryId if provided
    if (categoryId) {
        const catExists = categories.some((c) => c.id === categoryId);
        if (!catExists)
            return res.status(400).json({ message: "categoryId does not exist" });
    }
    // Validate categoryIds array if provided
    let parsedCategoryIds;
    if (categoryIds) {
        try {
            parsedCategoryIds = typeof categoryIds === 'string' ? JSON.parse(categoryIds) : categoryIds;
            if (!Array.isArray(parsedCategoryIds))
                throw new Error('categoryIds must be an array');
        }
        catch (e) {
            return res.status(400).json({ message: 'Invalid categoryIds' });
        }
        for (const cid of parsedCategoryIds) {
            if (!categories.some((c) => c.id === cid))
                return res.status(400).json({ message: `categoryId ${cid} does not exist` });
        }
    }
    let parsedColors = [];
    if (colors) {
        try {
            parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
            if (!Array.isArray(parsedColors))
                throw new Error('colors must be an array');
        }
        catch (e) {
            return res.status(400).json({ message: 'Invalid colors format' });
        }
    }
    let parsedSizes = [];
    if (sizes) {
        try {
            parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            if (!Array.isArray(parsedSizes))
                throw new Error('sizes must be an array');
        }
        catch (e) {
            return res.status(400).json({ message: 'Invalid sizes format' });
        }
    }
    // Parse variants if provided and attach uploaded files per-variant
    let parsedVariants = [];
    if (req.body.variants) {
        try {
            parsedVariants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
            if (!Array.isArray(parsedVariants))
                parsedVariants = [];
        }
        catch (e) {
            parsedVariants = [];
        }
    }
    // Map uploaded files to product images and variant images by fieldname
    const variantFilesMap = {};
    files.forEach((f) => {
        const field = f.fieldname || 'images';
        if (!variantFilesMap[field])
            variantFilesMap[field] = [];
        variantFilesMap[field].push(f.path);
    });
    // Attach images to parsedVariants if any variant files were uploaded using fieldnames like variantImages[0]
    parsedVariants = parsedVariants.map((v, idx) => {
        const key = `variantImages[${idx}]`;
        const attached = variantFilesMap[key] || [];
        return { ...v, images: attached.length > 0 ? attached : undefined };
    });
    const newP = {
        id: `product-${Date.now()}`,
        name,
        price: parseFloat(price),
        description: description || "",
        categoryId: categoryId || (parsedCategoryIds && parsedCategoryIds[0]) || "",
        categoryIds: parsedCategoryIds,
        image: imagePaths.length > 0 ? imagePaths[0] : undefined,
        images: imagePaths.length > 0 ? imagePaths : undefined,
        displayTags: displayTags ? JSON.parse(displayTags) : [],
        inStock: quantity > 0,
        quantity: parseInt(quantity) || 0,
        colors: parsedColors.length > 0 ? parsedColors : undefined,
        sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
    };
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("products");
    await col.insertOne(newP);
    res.status(201).json(newP);
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, categoryId, categoryIds, inStock, quantity, displayTags, colors, sizes } = req.body;
    const files = req.files || [];
    const imagePaths = files.map((f) => f.path);
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("products");
    const product = await col.findOne({ id });
    if (!product)
        return res.status(404).json({ message: "Product not found" });
    if (categoryId !== undefined) {
        const categories = await (0, store_1.getCategories)();
        const catExists = categories.some((c) => c.id === categoryId);
        if (!catExists)
            return res.status(400).json({ message: "categoryId does not exist" });
        product.categoryId = categoryId;
    }
    if (categoryIds !== undefined) {
        const categories = await (0, store_1.getCategories)();
        let parsedCategoryIds;
        try {
            parsedCategoryIds = typeof categoryIds === 'string' ? JSON.parse(categoryIds) : categoryIds;
            if (!Array.isArray(parsedCategoryIds))
                throw new Error('categoryIds must be an array');
        }
        catch (e) {
            return res.status(400).json({ message: 'Invalid categoryIds' });
        }
        for (const cid of parsedCategoryIds) {
            if (!categories.some((c) => c.id === cid))
                return res.status(400).json({ message: `categoryId ${cid} does not exist` });
        }
        product.categoryIds = parsedCategoryIds;
        // ensure categoryId field is set to first if missing
        if (!product.categoryId && parsedCategoryIds.length > 0)
            product.categoryId = parsedCategoryIds[0];
    }
    if (name !== undefined)
        product.name = name;
    if (price !== undefined)
        product.price = price;
    if (description !== undefined)
        product.description = description;
    if (imagePaths.length > 0) {
        product.image = imagePaths[0];
        product.images = imagePaths;
    }
    if (displayTags !== undefined)
        product.displayTags = typeof displayTags === 'string' ? JSON.parse(displayTags) : displayTags;
    if (inStock !== undefined)
        product.inStock = inStock;
    if (quantity !== undefined) {
        product.quantity = quantity;
        // Auto-update inStock based on quantity
        product.inStock = quantity > 0;
    }
    // Parse and attach variants if provided
    let parsedVariants = [];
    if (req.body.variants) {
        try {
            parsedVariants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
            if (!Array.isArray(parsedVariants))
                parsedVariants = [];
        }
        catch (e) {
            parsedVariants = [];
        }
    }
    // Map uploaded files to variants
    const variantFilesMap = {};
    files.forEach((f) => {
        const field = f.fieldname || 'images';
        if (!variantFilesMap[field])
            variantFilesMap[field] = [];
        variantFilesMap[field].push(f.path);
    });
    parsedVariants = parsedVariants.map((v, idx) => {
        const key = `variantImages[${idx}]`;
        const attached = variantFilesMap[key] || [];
        return { ...v, images: attached.length > 0 ? attached : (v.images || undefined) };
    });
    if (parsedVariants.length > 0)
        product.variants = parsedVariants;
    if (colors !== undefined) {
        try {
            const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
            if (Array.isArray(parsedColors)) {
                product.colors = parsedColors;
            }
        }
        catch (e) {
            return res.status(400).json({ message: 'Invalid colors format' });
        }
    }
    if (sizes !== undefined) {
        try {
            const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            if (Array.isArray(parsedSizes)) {
                product.sizes = parsedSizes;
            }
        }
        catch (e) {
            return res.status(400).json({ message: 'Invalid sizes format' });
        }
    }
    await col.updateOne({ id }, { $set: product });
    res.json(product);
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("products");
    const result = await col.deleteOne({ id });
    if (result.deletedCount === 0)
        return res.status(404).json({ message: "Product not found" });
    res.status(204).send();
};
exports.deleteProduct = deleteProduct;
const getProductsByCategory = async (req, res) => {
    const { categoryId } = req.params;
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("products");
    // Find products where primary categoryId matches OR categoryIds array contains the categoryId
    const products = await col.find({ $or: [{ categoryId }, { categoryIds: categoryId }] }).toArray();
    res.json(products);
};
exports.getProductsByCategory = getProductsByCategory;
/**
 * Get products by display tag
 * Example: GET /api/products/tag/Featured
 */
const getProductsByTag = async (req, res) => {
    const { tag } = req.params;
    const db = await (0, mongoConfig_1.connectMongo)();
    const col = db.collection("products");
    // Find products where displayTags array contains the tag
    const products = await col.find({ displayTags: tag }).toArray();
    res.json(products);
};
exports.getProductsByTag = getProductsByTag;
