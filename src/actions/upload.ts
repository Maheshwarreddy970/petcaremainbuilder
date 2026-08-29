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
    // 1. Extract the file from the FormData
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // 2. Convert the file into a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Process the image using Sharp
    // - Sharp automatically detects the input type (JPG, PNG, WebP, etc.)
    // - It automatically strips all heavy EXIF metadata.
    // - .avif() converts it to AVIF format.
    // - quality: 80 gives visually lossless results with massive file size reduction.
    // - effort: 6 is a great balance between compression speed and file size optimization.
    const processedBuffer = await sharp(buffer)
      .avif({ quality: 80, effort: 6 })
      .toBuffer();

    // 4. Stream the optimized AVIF buffer directly to Cloudinary
    const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nexpetcare_uploads", // Optional: Puts uploads in a specific Cloudinary folder
          format: "avif",               // Forces the Cloudinary extension to be .avif
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Write the processed buffer to the Cloudinary stream
      uploadStream.end(processedBuffer);
    });

    // 5. Return the secure URL to your frontend
    return { success: true, url: uploadResult.secure_url };
    
  } catch (error: any) {
    console.error("Image upload & optimization failed:", error);
    return { success: false, error: error.message };
  }
}