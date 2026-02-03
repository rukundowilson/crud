export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  // Single tag value for category (e.g. 'fashion-categories')
  tag?: string;
}

export interface ProductColor {
  name: string; // e.g., 'Blue', 'Red', 'Gray'
  hexColor?: string; // e.g., '#0066cc'
}

export interface ProductVariant {
  size?: string;
  color?: string;
  hexColor?: string;
  images?: string[]; // variant-specific images
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  // Optional list of additional categories the product belongs to
  categoryIds?: string[];
  inStock: boolean;
  quantity: number; // Total stock quantity
  image?: string; // Main/primary image
  // Multiple product images
  images?: string[];
  // Allow arbitrary string tags so frontend and admin can add custom tags
  // e.g. 'Featured', 'Mens', 'Womens', 'Popular', 'Categories', 'fashion-categories', etc.
  displayTags?: string[];
  // Available colors and sizes for user selection (independent lists)
  colors?: ProductColor[];
  sizes?: string[];
  // Optional variants with their own images
  variants?: ProductVariant[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}
export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: "user" | "admin";
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}