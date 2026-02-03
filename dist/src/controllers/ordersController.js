"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.updateOrder = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const uuid_1 = require("uuid");
const orders_1 = require("../data/orders");
/**
 * @route POST /api/orders
 * @desc Create a new order
 */
const createOrder = async (req, res) => {
    try {
        const { items, billingDetails, subtotal, shipping, total, status, } = req.body;
        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must have items" });
        }
        // Create order object
        const newOrder = {
            id: (0, uuid_1.v4)(),
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
        const orders = (0, orders_1.readOrders)();
        // Add new order
        orders.push(newOrder);
        // Save orders
        (0, orders_1.writeOrders)(orders);
        res.status(201).json({
            message: "Order created successfully",
            order: newOrder,
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order", error });
    }
};
exports.createOrder = createOrder;
/**
 * @route GET /api/orders
 * @desc Get all orders for current user
 */
const getUserOrders = async (req, res) => {
    try {
        const orders = (0, orders_1.readOrders)();
        const userOrders = orders.filter((order) => order.userId === req.userId);
        res.json(userOrders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", error });
    }
};
exports.getUserOrders = getUserOrders;
/**
 * @route GET /api/orders/:id
 * @desc Get order by ID
 */
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = (0, orders_1.readOrders)();
        // Find order by id
        const order = orders.find((o) => o.id === id);
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
    }
    catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Failed to fetch order", error });
    }
};
exports.getOrderById = getOrderById;
/**
 * @route PUT /api/orders/:id
 * @desc Update order status
 */
const updateOrder = async (req, res) => {
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
        const orders = (0, orders_1.readOrders)();
        // Find order by id (admins can update any order, regular users only their own)
        const orderIndex = orders.findIndex((o) => o.id === id);
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
        (0, orders_1.writeOrders)(orders);
        res.json({
            message: "Order updated successfully",
            order: orders[orderIndex],
        });
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Failed to update order", error });
    }
};
exports.updateOrder = updateOrder;
/**
 * @route GET /api/orders/admin/all
 * @desc Get all orders (admin only)
 */
const getAllOrders = async (req, res) => {
    try {
        // Check if user is admin
        if (req.userRole !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }
        const orders = (0, orders_1.readOrders)();
        res.json(orders);
    }
    catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", error });
    }
};
exports.getAllOrders = getAllOrders;
