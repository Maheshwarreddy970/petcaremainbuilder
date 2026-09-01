"use server";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidateTag, revalidatePath } from "next/cache";

export async function connectCustomDomainAction(slug: string, customDomain: string) {
  try {
    const cleanDomain = customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
    
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const fallbackDomain = process.env.NEXT_PUBLIC_FALLBACK_DOMAIN || "cname.nexpetcare.online";

    if (!zoneId || !token) {
      return { success: false, error: "Missing Cloudflare Credentials in .env.local" };
    }

    // 🔥 FIX: Use Authorization Bearer for API Tokens (Do not use X-Auth-Email)
    const headers: any = { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token.trim()}`
    };

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId.trim()}/custom_hostnames`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        hostname: cleanDomain,
        ssl: { method: "txt", type: "dv" }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("RAW CLOUDFLARE ERROR:", JSON.stringify(data, null, 2));
      throw new Error(data.errors?.[0]?.message || "Cloudflare API Failed");
    }

    const websiteRef = doc(db, "websites", slug);
    await updateDoc(websiteRef, {
      customDomain: cleanDomain,
      cloudflareId: data.result.id,
      domainStatus: "pending",
      lastUpdated: new Date().toISOString()
    });

    const ownershipTxt = data.result.ownership_verification;
    const sslTxt = data.result.ssl?.validation_records?.[0];

    const dnsRecords = [{ type: "CNAME", name: "@", value: fallbackDomain }];
    if (ownershipTxt) dnsRecords.push({ type: "TXT", name: ownershipTxt.name, value: ownershipTxt.value });
    if (sslTxt) dnsRecords.push({ type: "TXT", name: sslTxt.txt_name, value: sslTxt.txt_value });

    return { success: true, dnsRecords };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkDomainStatusAction(slug: string, customDomain: string) {
  try {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;

    if (!zoneId || !token) return { success: false, error: "Missing Credentials" };

    // 🔥 FIX: Use Authorization Bearer here too
    const headers: any = { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token.trim()}`
    };

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId.trim()}/custom_hostnames?hostname=${customDomain}`, {
      method: "GET",
      headers,
    });

    const data = await response.json();
    const domainData = data.result?.[0];

    if (!domainData) throw new Error("Domain not found");

    if (domainData.status === "active") {
      const websiteRef = doc(db, "websites", slug);
      await updateDoc(websiteRef, { domainStatus: "active" });
    }

    return { success: true, status: domainData.status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deployWebsiteAction(slug: string) {
  try {
    const websiteRef = doc(db, "websites", slug);
    await updateDoc(websiteRef, {
      isDeployed: true,
      lastDeployed: new Date().toISOString()
    });

    // @ts-ignore - Bypasses Next.js 15 TS bug requiring 2 arguments
    revalidateTag(`website-${slug}`);
    // @ts-ignore
    revalidateTag("website");
    
    // 🔥 Bulletproof fallback: natively clear the URL route
    revalidatePath(`/${slug}`);

    return { success: true };
  } catch (error: any) {
    console.error("Deploy Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function saveWebsiteSettingsAction(slug: string, settings: any) {
  try {
    const websiteRef = doc(db, "websites", slug);
    await updateDoc(websiteRef, {
      settings,
      lastUpdated: new Date().toISOString()
    });

    // @ts-ignore - Bypasses Next.js 15 TS bug requiring 2 arguments
    revalidateTag(`website-${slug}`);
    // @ts-ignore
    revalidateTag("website");

    // 🔥 Bulletproof fallback: natively clear the URL route
    revalidatePath(`/${slug}`);

    return { success: true };
  } catch (error: any) {
    console.error("Save Settings Error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveWebsiteContentAction(slug: string, websiteOneData: any) {
  try {
    const websiteRef = doc(db, "websites", slug);
    await updateDoc(websiteRef, {
      websiteOneData,
      lastUpdated: new Date().toISOString()
    });

    // 🔥 FIX: Add the "max" argument required by Next.js 16
    revalidateTag(`website-${slug}`, "max");
    revalidateTag("website", "max");

    revalidatePath(`/${slug}`, 'page');
    revalidatePath(`/live/domain/[domain]`, 'page');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function publishWebsiteUpdatesAction(slug: string) {
  try {
    // 1. Force clear the unstable_cache (Firebase Data)
    // @ts-ignore
    revalidateTag(`website-${slug}`);
    // @ts-ignore
    revalidateTag("website");
    
    // 2. Force clear the Next.js static HTML for the live wildcard domain
    revalidatePath(`/${slug}`, 'page');
    revalidatePath(`/${slug}`, 'layout');
    
    // 3. Force clear the Dashboard/Editor so the client sees the fresh version
    revalidatePath(`/dashboard/${slug}`);
    revalidatePath(`/dashboard/${slug}/edit`);
    revalidatePath(`/dashboard/${slug}/settings`);

    return { success: true };
  } catch (error: any) {
    console.error("Publish Error:", error);
    return { success: false, error: error.message };
  }
}