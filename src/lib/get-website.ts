import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { unstable_cache } from "next/cache";

export const getWebsiteData = async (slug: string) => {
  if (!slug || typeof slug !== "string") {
    return null;
  }

  const fetchCachedWebsite = unstable_cache(
    async () => {
      try {
        const isCustomDomain = slug.includes(".");
        const searchField = isCustomDomain ? "customDomain" : "slug";

        const q = query(collection(db, "websites"), where(searchField, "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        return snapshot.docs[0].data();
      } catch (error) {
        console.error("Error fetching website:", error);
        return null;
      }
    },
    [`website-cache-key-${slug}-v3`], 
    {
      tags: [`website-${slug}`, "website"],
      revalidate: false // 🔥 CRITICAL FIX: Tells Vercel to cache this FOREVER until you click Publish
    }
  );

  return fetchCachedWebsite();
};