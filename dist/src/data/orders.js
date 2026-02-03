"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeOrders = exports.readOrders = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ordersFile = path_1.default.join(__dirname, "../../data/orders.json");
// Initialize orders file if it doesn't exist
if (!fs_1.default.existsSync(ordersFile)) {
    // Create data directory if it doesn't exist
    const dataDir = path_1.default.dirname(ordersFile);
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    fs_1.default.writeFileSync(ordersFile, JSON.stringify([]), "utf-8");
}
const readOrders = () => {
    try {
        const data = fs_1.default.readFileSync(ordersFile, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        return [];
    }
};
exports.readOrders = readOrders;
const writeOrders = (orders) => {
    try {
        fs_1.default.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8");
    }
    catch (error) {
        console.error("Error writing orders:", error);
    }
};
exports.writeOrders = writeOrders;
