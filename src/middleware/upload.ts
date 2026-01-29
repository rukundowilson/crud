import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import "dotenv/config";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || "nextdoor",
    resource_type: "auto",
  } as any,
});

export const uploadMiddleware = multer({ storage });
