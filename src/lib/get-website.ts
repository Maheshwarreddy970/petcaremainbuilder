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
        // 🔥 Detect if 'slug' is actually a custom domain (e.g., contains a dot)
        const isCustomDomain = slug.includes(".");
        const searchField = isCustomDomain ? "customDomain" : "slug";

        // Query by either 'customDomain' OR 'slug' dynamically
        const q = query(collection(db, "websites"), where(searchField, "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        return snapshot.docs[0].data();
      } catch (error) {
        console.error("Error fetching website:", error);
        return null;
      }
    },
    [`website-cache-key-${slug}-v2`], 
    {
      tags: [`website-${slug}`] 
    }
  );

  return fetchCachedWebsite();
};