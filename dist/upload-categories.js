"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWFiMTAzZi05YTEwLTQ3MWUtYjdmZS01NzkwMjNkNGU2OGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njk1MTA1OTMsImV4cCI6MTc2OTU5Njk5M30.YlfQ_iWvVYMSFHlNKPoQdCsPYRz76XS-ZkW07PsonU4";
const API_URL = "http://localhost:3000/api/categories";
const categories = [
    { name: "Men", description: "Men's Fashion Collection", image: "men.jpg" },
    { name: "Women", description: "Women's Fashion Collection", image: "women-150x150.jpg" },
    { name: "Shoes", description: "Footwear Collection", image: "Shoes-150x150.jpg" },
    { name: "Bags & Backpacks", description: "Bags and Backpacks", image: "Bags-150x150.png" },
    { name: "Watches", description: "Watch Collection", image: "Watch-150x150.jpg" },
    { name: "Jewellery", description: "Jewelry Collection", image: "Jewellery-150x150.jpg" },
    { name: "Accessories", description: "Fashion Accessories", image: "Accessories-150x150.jpg" },
    { name: "Tops", description: "Tops Collection", image: "Women-Khaki-Solid-Top-150x150.jpg" },
];
async function uploadCategories() {
    for (const category of categories) {
        try {
            const imagePath = path_1.default.join('/home/willy/combo/nextDoor/public/asset/img', category.image);
            if (!fs_1.default.existsSync(imagePath)) {
                console.log(`⚠️  Image not found: ${category.image}`);
                continue;
            }
            const form = new form_data_1.default();
            form.append('name', category.name);
            form.append('description', category.description);
            form.append('image', fs_1.default.createReadStream(imagePath));
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    ...form.getHeaders(),
                },
                body: form,
            });
            const result = await response.json();
            if (response.ok) {
                console.log(`✅ Uploaded: ${category.name}`);
                console.log(`   Image URL: ${result.image}`);
            }
            else {
                console.log(`❌ Failed: ${category.name} - ${result.message}`);
            }
        }
        catch (error) {
            console.error(`Error uploading ${category.name}:`, error);
        }
    }
}
uploadCategories();
