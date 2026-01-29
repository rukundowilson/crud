import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../controllers/productsController";
import { uploadMiddleware } from "../middleware/upload";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.get("/category/:categoryId", getProductsByCategory);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, adminMiddleware, uploadMiddleware.single("image"), createProduct);
router.put("/:id", authMiddleware, adminMiddleware, uploadMiddleware.single("image"), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
