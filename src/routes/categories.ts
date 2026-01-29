import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { uploadMiddleware } from "../middleware/upload";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoriesController";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", authMiddleware, adminMiddleware, uploadMiddleware.single("image"), createCategory);
router.put("/:id", authMiddleware, adminMiddleware, uploadMiddleware.single("image"), updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;
