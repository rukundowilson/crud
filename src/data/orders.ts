import fs from "fs";
import path from "path";

const ordersFile = path.join(__dirname, "../../data/orders.json");

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ordersFile)) {
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(ordersFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(ordersFile, JSON.stringify([]), "utf-8");
}

export const readOrders = (): any[] => {
  try {
    const data = fs.readFileSync(ordersFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const writeOrders = (orders: any[]): void => {
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing orders:", error);
  }
};
