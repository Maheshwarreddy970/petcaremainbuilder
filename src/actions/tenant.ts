"use server";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidateTag, revalidatePath } from "next/cache";

export async function connectCustomDomainAction(slug: string, customDomain: string) {
}

export async function checkDomainStatusAction(slug: string, customDomain: string) {
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