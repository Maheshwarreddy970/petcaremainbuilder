"use server";

export async function submitContactFormAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  // We pass the target business email directly from the template data!
  const targetEmail = formData.get("targetEmail") as string;

  if (!name || !email || !message || !targetEmail) {
    return { success: false, error: "Missing required fields." };
  }

  // Clean the mailto: if it exists
  const cleanTargetEmail = targetEmail.replace("mailto:", "");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer re_DfMBGmV1_2t6JCohWdQgcLNhuERDw2QnD`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Must be your verified domain on Resend
        from: "NexPet Care <noreply@nexpetcare.online>", 
        to: cleanTargetEmail,
        // 🔥 THIS IS THE MAGIC: When the owner hits "Reply", it goes to the customer!
        reply_to: email, 
        subject: `New Website Lead: ${name}`,
        html: `
          <h2>New message from your website!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
            ${message}
          </blockquote>
          <hr />
          <p><small><em>Simply click <strong>Reply</strong> to respond directly to ${name}.</em></small></p>
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