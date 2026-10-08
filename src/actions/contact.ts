"use server";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function findWebsite(slugOrDomain: string) {
  const value = slugOrDomain.trim().toLowerCase();

  // Custom domain (contains a dot): match with or without "www."
  if (value.includes(".")) {
    const bare = value.replace(/^www\./, "");
    const q = query(
      collection(db, "websites"),
      where("customDomain", "in", [bare, `www.${bare}`]),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  }

  // Subdomain slug: try document ID first, then a "slug" field
  const byId = await getDoc(doc(db, "websites", value));
  if (byId.exists()) return byId.data();

  const snap = await getDocs(
    query(collection(db, "websites"), where("slug", "==", value), limit(1))
  );
  return snap.empty ? null : snap.docs[0].data();
}

function esc(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function submitContactFormAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;
  const slug = formData.get("slug") as string;

  if (!name || !email || !phone || !message || !slug || slug === "undefined") {
    return { success: false, error: "Missing required fields. Please refresh and try again." };
  }

  try {
    const dbData = await findWebsite(slug);
    if (!dbData) return { success: false, error: "Website configuration not found." };

    if (dbData.paid !== true) {
      return { success: false, error: "Form submissions are temporarily disabled for this website. Please contact the business directly." };
    }


    const targetEmail =
      dbData.ownerEmail ||
      dbData.websiteOneData?.footer?.info?.email?.href?.replace("mailto:", "");
    if (!targetEmail) {
      return { success: false, error: "This website has not configured a receiving email address yet." };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NexPet Care <noreply@nexpetcare.com>",
        to: targetEmail.replace("mailto:", "").trim(),
        reply_to: email,
        subject: `New Website Lead: ${name}`.slice(0, 150),
        html: `
          <div style="font-family:sans-serif;color:#333;max-width:600px;line-height:1.6;">
            <h2 style="color:#1e0c05;">New message from your website!</h2>
            <p><strong>Name:</strong> ${esc(name)}</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            <p><strong>Phone:</strong> ${esc(phone)}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left:4px solid #a35c38;padding:14px;background:#f9f9f9;border-radius:4px;">
              ${esc(message).replace(/\n/g, "<br>")}
            </blockquote>
          </div>`,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to send email.");
    }
    return { success: true };
  } catch (error: any) {
    console.error("Server Error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}