import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { unstable_cache } from "next/cache";

export const getWebsiteData = async (slug: string) => {
  if (!slug || typeof slug !== "string") {
    return null;
  }

  // 🔥 This caches the result FOREVER. 
  // It will NEVER hit Firebase again until revalidateTag() is called.
  const fetchCachedWebsite = unstable_cache(
    async () => {
      try {
        const q = query(collection(db, "websites"), where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        return snapshot.docs[0].data();
      } catch (error) {
        console.error("Error fetching website:", error);
        return null;
      }
    },
    [`website-cache-key-${slug}`], // Unique key for the Edge Network
    {
      tags: [`website-${slug}`] // The exact tag we will target on "Save"
    }
  );

  return fetchCachedWebsite();
};