"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
require("dotenv/config");
// Configure Cloudinary from environment variables
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    timeout: 60000, // 60 seconds timeout
    chunk_size: 6000000, // 6MB chunk size for large files
});
exports.default = cloudinary_1.v2;
