import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByTag,
} from "../controllers/productsController";
import { uploadMiddleware } from "../middleware/upload";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/category/:categoryId", getProductsByCategory);
router.get("/tag/:tag", getProductsByTag);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
// Accept any file fields (product images and variant images)
router.post("/", authMiddleware, adminMiddleware, uploadMiddleware.any(), createProduct);
router.put("/:id", authMiddleware, adminMiddleware, uploadMiddleware.any(), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
