"use server";

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    console.log(`📥 Received: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("⚙️ Resizing, compressing, and converting to AVIF...");
    
    // 🔥 NEW: Sharp Pipeline with Resizing and Aggressive Compression
    const processedBuffer = await sharp(buffer)
      // Caps width at 1920px (standard HD). If the image is smaller, it won't enlarge it.
      .resize({ width: 1920, withoutEnlargement: true }) 
      // Quality 65 for AVIF is the sweet spot for web.
      .avif({ quality: 65, effort: 6 })
      .toBuffer();

    console.log(`✅ Processed down to: ${(processedBuffer.length / 1024).toFixed(2)} KB`);
    
    const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nexpetcare_uploads",
          format: "avif",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(processedBuffer);
    });

    return { success: true, url: uploadResult.secure_url };
    
  } catch (error: any) {
    console.error("Image upload & optimization failed:", error);
    return { success: false, error: error.message };
  }
}