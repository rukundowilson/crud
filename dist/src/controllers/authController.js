"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.login = exports.register = void 0;
const uuid_1 = require("uuid");
const users_1 = require("../data/users");
const auth_1 = require("../middleware/auth");
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, password, and name are required" });
        }
        const existingUser = await (0, users_1.getUser)(email);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const newUser = {
            id: (0, uuid_1.v4)(),
            email,
            password,
            name,
            role: "user",
            createdAt: new Date(),
        };
        await (0, users_1.createUser)(newUser);
        const token = (0, auth_1.generateToken)(newUser.id, newUser.role);
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
};
exports.register = register;
/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await (0, users_1.getUser)(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await (0, users_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, auth_1.generateToken)(user.id, user.role);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
};
exports.login = login;
/**
 * @route GET /api/auth/me
 * @desc Get current user info
 */
const getCurrentUser = async (req, res) => {
    try {
        const user = await (0, users_1.getUserById)(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch user", error });
    }
};
exports.getCurrentUser = getCurrentUser;
