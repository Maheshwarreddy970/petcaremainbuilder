import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, or } from "firebase/firestore"; // 🔥 Added "or"
import { unstable_cache } from "next/cache";

export const getWebsiteData = async (slugOrDomain: string) => {
  if (!slugOrDomain || typeof slugOrDomain !== "string") {
    return null;
  }

  const fetchCachedWebsite = unstable_cache(
    async () => {
      try {
        // 🔥 FIX: Search Firebase for EITHER the slug OR the customDomain!
        const q = query(
          collection(db, "websites"), 
          or(
            where("slug", "==", slugOrDomain),
            where("customDomain", "==", slugOrDomain)
          )
        );
        
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        return snapshot.docs[0].data();
      } catch (error) {
        console.error("Error fetching website:", error);
        return null;
      }
    },
    [`website-cache-key-${slugOrDomain}`],
    {
      tags: [`website-${slugOrDomain}`]
    }
  );

  return fetchCachedWebsite();
};