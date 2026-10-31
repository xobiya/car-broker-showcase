import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { db } from "../db/index";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed."));
  },
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "autobroker",
  publicId?: string,
  mimetype?: string,
  originalname?: string,
  ownerId?: string
): Promise<string> {
  // If Cloudinary credentials are not configured, store directly in MongoDB database
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const url = await db.saveMedia({
        filename: originalname,
        mimetype: mimetype || "image/jpeg",
        folder,
        owner_id: ownerId,
        buffer: fileBuffer,
      });
      return url;
    } catch (e) {
      console.error("[Upload] Database media save error:", e);
      throw e;
    }
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return true;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch {
    return false;
  }
}
