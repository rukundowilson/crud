import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { LoginRequest, User } from "../types";
import { getUser, createUser, verifyPassword, getUserById } from "../data/users";
import { generateToken } from "../middleware/auth";

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    const existingUser = await getUser(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser: User = {
      id: uuid(),
      email,
      password,
      name,
      role: "user",
      createdAt: new Date(),
    };

    await createUser(newUser);

    const token = generateToken(newUser.id, newUser.role);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await getUser(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 */
export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error });
  }
};
