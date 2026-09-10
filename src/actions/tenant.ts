"use server";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidateTag, revalidatePath } from "next/cache";

// 🔥 SMART AUTH HELPER: Automatically formats headers for Tokens OR Global Keys
// 🔥 SMART AUTH HELPER: Automatically formats headers for Tokens OR Global Keys
function getCloudflareHeaders(): Record<string, string> {
  const email = process.env.CLOUDFLARE_EMAIL?.trim();
  const apiKey = (process.env.CLOUDFLARE_GLOBAL_API_KEY || process.env.CLOUDFLARE_API_TOKEN)?.trim();

  if (!apiKey) throw new Error("Missing Cloudflare API Key in .env.local");

  // Start with the base headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  // If the key starts with 'cfk_' or is very long, it is a Bearer Token.
  if (apiKey.startsWith("cfk_") || apiKey.length > 38) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  } else {
    // Otherwise, it is a traditional Global API Key
    headers["X-Auth-Email"] = email || "";
    headers["X-Auth-Key"] = apiKey;
  }

  return headers;
}

export async function connectCustomDomainAction(slug: string, customDomain: string) {
  try {
    const cleanDomain = customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
    const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
    const fallbackDomain = process.env.NEXT_PUBLIC_FALLBACK_DOMAIN || "cname.nexpetcare.online";

    if (!zoneId) return { success: false, error: "Missing Cloudflare ZONE_ID in .env.local" };

    const headers = getCloudflareHeaders();

    // 1. SMART CHECK
    const checkResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=${cleanDomain}`, {
      method: "GET",
      headers,
    });
    
    const checkData = await checkResponse.json();
    if (!checkResponse.ok) throw new Error(checkData.errors?.[0]?.message || "Cloudflare Auth Error");
    
    let domainData = (checkData.result || []).find((item: any) => item.hostname.toLowerCase() === cleanDomain);

    // 2. CREATE IF MISSING
    if (!domainData) {
      const createResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          hostname: cleanDomain,
          ssl: { method: "txt", type: "dv" }
        }),
      });
      
      const createData = await createResponse.json();
      if (!createResponse.ok) throw new Error(createData.errors?.[0]?.message || "Cloudflare Create Error");
      domainData = createData.result;
    }

    // 3. EXTRACT RECORDS
    const ownershipTxt = domainData.ownership_verification;
    const sslTxt = domainData.ssl?.validation_records?.[0];

    const dnsRecords = [{ type: "CNAME", name: "@", value: fallbackDomain }];
    if (ownershipTxt) dnsRecords.push({ type: "TXT", name: ownershipTxt.name, value: ownershipTxt.value });
    if (sslTxt) dnsRecords.push({ type: "TXT", name: sslTxt.txt_name, value: sslTxt.txt_value });

    // 4. UPDATE FIREBASE
    const websiteRef = doc(db, "websites", slug);
    await updateDoc(websiteRef, {
      customDomain: cleanDomain,
      cloudflareId: domainData.id,
      domainStatus: domainData.status === "active" ? "active" : "pending",
      dnsRecords: dnsRecords,
      lastUpdated: new Date().toISOString()
    });

    return { success: true, dnsRecords };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkDomainStatusAction(slug: string, customDomain: string) {
  try {
    const cleanDomain = customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
    const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();

    if (!zoneId) return { success: false, error: "Missing Credentials" };

    const headers = getCloudflareHeaders();

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=${cleanDomain}`, {
      method: "GET",
      headers,
    });

    const data = await response.json();
    
    // 🔥 If auth fails, it will now throw the exact Cloudflare error instead of "Not found"
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || "Authentication failed with Cloudflare API");
    }

    // Safely find the exact domain
    const domainData = (data.result || []).find((item: any) => item.hostname.toLowerCase() === cleanDomain);

    if (!domainData) throw new Error(`Domain '${cleanDomain}' not found in your Cloudflare zone.`);

    // Update Firebase if it is officially active!
    if (domainData.status === "active") {
      const websiteRef = doc(db, "websites", slug);
      await updateDoc(websiteRef, { domainStatus: "active", dnsRecords: null });
    }

    return { success: true, status: domainData.status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Keep your discoverDomainConnectAction here at the bottom if you have it!


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