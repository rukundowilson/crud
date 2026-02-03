import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readOrders, writeOrders } from "../data/orders";

/**
 * @route POST /api/orders
 * @desc Create a new order
 */
export const createOrder = async (req: any, res: Response) => {
  try {
    const {
      items,
      billingDetails,
      subtotal,
      shipping,
      total,
      status,
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must have items" });
    }

    // Create order object
    const newOrder = {
      id: uuidv4(),
      userId: req.userId, // From auth middleware
      items,
      billingDetails,
      subtotal,
      shipping,
      total,
      // default to 'processing' instead of 'pending'
      status: status || "processing",
      createdAt: new Date(),
    };

    // Get existing orders
    const orders = readOrders();

    // Add new order
    orders.push(newOrder);

    // Save orders
    writeOrders(orders);

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order", error });
  }
};

/**
 * @route GET /api/orders
 * @desc Get all orders for current user
 */
export const getUserOrders = async (req: any, res: Response) => {
  try {
    const orders = readOrders();
    const userOrders = orders.filter((order: any) => order.userId === req.userId);

    res.json(userOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

/**
 * @route GET /api/orders/:id
 * @desc Get order by ID
 */
export const getOrderById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const orders = readOrders();
    // Find order by id
    const order = orders.find((o: any) => o.id === id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization: allow if owner or admin
    const isOwner = order.userId === req.userId;
    const isAdmin = req.userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: cannot view this order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order", error });
  }
};

/**
 * @route PUT /api/orders/:id
 * @desc Update order status
 */
export const updateOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Normalize some legacy status values
    if (status === "received") {
      status = "completed";
    }

    const orders = readOrders();

    // Find order by id (admins can update any order, regular users only their own)
    const orderIndex = orders.findIndex((o: any) => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent updates if order already completed
    const currentStatus = orders[orderIndex].status;
    if (currentStatus === "completed" || currentStatus === "received") {
      return res.status(400).json({ message: "Order is completed and cannot be modified" });
    }

    // Authorization: allow if owner or admin
    const isOwner = orders[orderIndex].userId === req.userId;
    const isAdmin = req.userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: cannot update this order" });
    }

    // Update order status
    orders[orderIndex].status = status;
    writeOrders(orders);

    res.json({
      message: "Order updated successfully",
      order: orders[orderIndex],
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Failed to update order", error });
  }
};

/**
 * @route GET /api/orders/admin/all
 * @desc Get all orders (admin only)
 */
export const getAllOrders = async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    const orders = readOrders();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};
