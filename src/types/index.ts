export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  inStock: boolean;
  quantity: number;
  image?: string;
  displayTags?: ("Featured" | "Mens" | "Womens" | "Popular" | "Categories")[];
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