"use server";

export async function uploadImageAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "doscyny4j";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "website_builder";

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }

  const data = await res.json();
  
  // 🔥 CRITICAL: This intercepts the Cloudinary URL and injects f_auto,q_auto
  // This forces the image to heavily compress and convert to AVIF or WebP automatically
  const optimizedUrl = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
  
  return optimizedUrl;
}