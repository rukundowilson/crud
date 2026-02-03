import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrder,
  getAllOrders,
} from "../controllers/ordersController";

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - billingDetails
 *               - total
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               billingDetails:
 *                 type: object
 *               subtotal:
 *                 type: number
 *               shipping:
 *                 type: number
 *               total:
 *                 type: number
 *               status:
 *                 type: string
 *                 example: completed
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders for current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getUserOrders);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       403:
 *         description: Forbidden - Admin access required
 *       401:
 *         description: Unauthorized
 */
router.get("/admin/all", authMiddleware, getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authMiddleware, getOrderById);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     tags:
 *       - Orders
 *     summary: Update order status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authMiddleware, updateOrder);

export default router;
