import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 60000, // 60 seconds timeout
  chunk_size: 6000000, // 6MB chunk size for large files
});

export default cloudinary;
