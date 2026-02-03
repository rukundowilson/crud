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
  const { name, price, description, categoryId, categoryIds, displayTags, quantity, colors, sizes } = req.body;
  const files = (req as any).files || [];
  const imagePaths = files.map((f: any) => f.path);

  if (!name || price === undefined || (!categoryId && !categoryIds)) {
    return res.status(400).json({ message: "Missing required product fields: name, price, and at least one categoryId or categoryIds" });
  }

  const categories = await getCategories();
  // Validate single categoryId if provided
  if (categoryId) {
    const catExists = categories.some((c) => c.id === categoryId);
    if (!catExists) return res.status(400).json({ message: "categoryId does not exist" });
  }
  // Validate categoryIds array if provided
  let parsedCategoryIds: string[] | undefined;
  if (categoryIds) {
    try {
      parsedCategoryIds = typeof categoryIds === 'string' ? JSON.parse(categoryIds) : categoryIds;
      if (!Array.isArray(parsedCategoryIds)) throw new Error('categoryIds must be an array');
    } catch (e) {
      return res.status(400).json({ message: 'Invalid categoryIds' });
    }
    for (const cid of parsedCategoryIds) {
      if (!categories.some((c) => c.id === cid)) return res.status(400).json({ message: `categoryId ${cid} does not exist` });
    }
  }

  let parsedColors: any[] = [];
  if (colors) {
    try {
      parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      if (!Array.isArray(parsedColors)) throw new Error('colors must be an array');
    } catch (e) {
      return res.status(400).json({ message: 'Invalid colors format' });
    }
  }

  let parsedSizes: string[] = [];
  if (sizes) {
    try {
      parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      if (!Array.isArray(parsedSizes)) throw new Error('sizes must be an array');
    } catch (e) {
      return res.status(400).json({ message: 'Invalid sizes format' });
    }
  }

  // Parse variants if provided and attach uploaded files per-variant
  let parsedVariants: any[] = [];
  if ((req.body as any).variants) {
    try {
      parsedVariants = typeof (req.body as any).variants === 'string' ? JSON.parse((req.body as any).variants) : (req.body as any).variants;
      if (!Array.isArray(parsedVariants)) parsedVariants = [];
    } catch (e) {
      parsedVariants = [];
    }
  }

  // Map uploaded files to product images and variant images by fieldname
  const variantFilesMap: Record<string, string[]> = {};
  files.forEach((f: any) => {
    const field = f.fieldname || 'images';
    if (!variantFilesMap[field]) variantFilesMap[field] = [];
    variantFilesMap[field].push(f.path);
  });

  // Attach images to parsedVariants if any variant files were uploaded using fieldnames like variantImages[0]
  parsedVariants = parsedVariants.map((v: any, idx: number) => {
    const key = `variantImages[${idx}]`;
    const attached = variantFilesMap[key] || [];
    return { ...v, images: attached.length > 0 ? attached : undefined };
  });

  const newP: Product = {
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

  const db = await connectMongo();
  const col = db.collection<Product>("products");
  await col.insertOne(newP as any);
  res.status(201).json(newP);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description, categoryId, categoryIds, inStock, quantity, displayTags, colors, sizes } = req.body as Partial<Product>;
  const files = (req as any).files || [];
  const imagePaths = files.map((f: any) => f.path);

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

  if (categoryIds !== undefined) {
    const categories = await getCategories();
    let parsedCategoryIds: string[];
    try {
      parsedCategoryIds = typeof categoryIds === 'string' ? JSON.parse(categoryIds) : categoryIds;
      if (!Array.isArray(parsedCategoryIds)) throw new Error('categoryIds must be an array');
    } catch (e) {
      return res.status(400).json({ message: 'Invalid categoryIds' });
    }
    for (const cid of parsedCategoryIds) {
      if (!categories.some((c) => c.id === cid)) return res.status(400).json({ message: `categoryId ${cid} does not exist` });
    }
    product.categoryIds = parsedCategoryIds;
    // ensure categoryId field is set to first if missing
    if (!product.categoryId && parsedCategoryIds.length > 0) product.categoryId = parsedCategoryIds[0];
  }

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (description !== undefined) product.description = description;
  if (imagePaths.length > 0) {
    product.image = imagePaths[0];
    product.images = imagePaths;
  }
  if (displayTags !== undefined) product.displayTags = typeof displayTags === 'string' ? JSON.parse(displayTags) : displayTags;
  if (inStock !== undefined) product.inStock = inStock;
  if (quantity !== undefined) {
    product.quantity = quantity;
    // Auto-update inStock based on quantity
    product.inStock = quantity > 0;
  }
  // Parse and attach variants if provided
  let parsedVariants: any[] = [];
  if ((req.body as any).variants) {
    try {
      parsedVariants = typeof (req.body as any).variants === 'string' ? JSON.parse((req.body as any).variants) : (req.body as any).variants;
      if (!Array.isArray(parsedVariants)) parsedVariants = [];
    } catch (e) {
      parsedVariants = [];
    }
  }

  // Map uploaded files to variants
  const variantFilesMap: Record<string, string[]> = {};
  files.forEach((f: any) => {
    const field = f.fieldname || 'images';
    if (!variantFilesMap[field]) variantFilesMap[field] = [];
    variantFilesMap[field].push(f.path);
  });

  parsedVariants = parsedVariants.map((v: any, idx: number) => {
    const key = `variantImages[${idx}]`;
    const attached = variantFilesMap[key] || [];
    return { ...v, images: attached.length > 0 ? attached : (v.images || undefined) };
  });

  if (parsedVariants.length > 0) product.variants = parsedVariants;
  if (colors !== undefined) {
    try {
      const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      if (Array.isArray(parsedColors)) {
        product.colors = parsedColors;
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid colors format' });
    }
  }
  if (sizes !== undefined) {
    try {
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      if (Array.isArray(parsedSizes)) {
        product.sizes = parsedSizes;
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid sizes format' });
    }
  }

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
  // Find products where primary categoryId matches OR categoryIds array contains the categoryId
  const products = await col.find({ $or: [{ categoryId }, { categoryIds: categoryId }] }).toArray();
  res.json(products);
};

/**
 * Get products by display tag
 * Example: GET /api/products/tag/Featured
 */
export const getProductsByTag = async (req: Request, res: Response) => {
  const { tag } = req.params;
  const db = await connectMongo();
  const col = db.collection<Product>("products");

  // Find products where displayTags array contains the tag
  const products = await col.find({ displayTags: tag }).toArray();
  res.json(products);
};
