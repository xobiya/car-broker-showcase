import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

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
  mimetype?: string
): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const rawExt = mimetype ? (mimetype.split("/")[1] || "jpg").replace("+xml", "") : "jpg";
      const ext = rawExt === "jpeg" ? "jpg" : rawExt;
      const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "");
      const filename = `${safeFolder}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, fileBuffer);
      return `/uploads/${filename}`;
    } catch (e) {
      console.warn("[Upload] Local disk write fallback failed, using default placeholder:", e);
      return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
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
