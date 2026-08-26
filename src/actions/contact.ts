"use server";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function submitContactFormAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;
  const slug = formData.get("slug") as string; // We get the site ID, not the email

  if (!name || !email || !phone || !message || !slug) {
    return { success: false, error: "Missing required fields." };
  }

  try {
    // 1. Securely fetch the target email from the database
    const docRef = doc(db, "websites", slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Website configuration not found." };
    }

    const dbData = docSnap.data();
    
    // Fallback logic: Try root ownerEmail first, then footer email
    let targetEmail = dbData.ownerEmail;
    if (!targetEmail && dbData.websiteOneData?.footer?.info?.email?.href) {
        targetEmail = dbData.websiteOneData.footer.info.email.href.replace("mailto:", "");
    }

    if (!targetEmail) {
        return { success: false, error: "This website has not configured an email address yet." };
    }

    const cleanTargetEmail = targetEmail.replace("mailto:", "").trim();

    // 2. Send the email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization":  `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NexPet Care <noreply@nexpetcare.online>", 
        to: cleanTargetEmail,
        reply_to: email, // Directly reply to the customer
        subject: `New Website Lead: ${name}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.6;">
            <h2 style="color: #1e0c05;">New message from your website!</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #a35c38; padding-left: 14px; color: #555; background: #f9f9f9; padding: 14px; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </blockquote>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><small style="color: #888;"><em>Simply click <strong>Reply</strong> in your email client to respond directly to ${name}.</em></small></p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to send email.");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Resend Error:", error);
    return { success: false, error: error.message };
  }
}