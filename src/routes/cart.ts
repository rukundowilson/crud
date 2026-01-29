import { Router } from "express";
import {
  getCart,
  addItem,
  updateItem,
  deleteItem,
  clearCart,
} from "../controllers/cartController";

const router = Router({ mergeParams: true });

router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:id", updateItem);
router.delete("/items/:id", deleteItem);
router.delete("/", clearCart);

export default router;
