import { notFound } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path if needed
import WebsiteOne from "@/components/templates/WebsiteOne";

// Helper function to find a client by their custom domain
async function getWebsiteByDomain(domain: string) {
    try {
        const q = query(
            collection(db, "websites"), 
            where("customDomain", "==", domain) // Looks for the domain in Firebase
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) return null;
        
        // Return the first match
        return querySnapshot.docs[0].data();
    } catch (error) {
        return null;
    }
}

export default async function CustomDomainPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;

    // Fetch the client data from Firebase based on the external domain
    const dbData = await getWebsiteByDomain(domain);

    // If no client has registered this domain, show a 404
    if (!dbData || !dbData.isDeployed) {
        return notFound();
    }

    // Render the website! The URL bar will still say "pettowngrooming.com"
    return (
        <main className="w-full min-h-screen">
            <WebsiteOne data={dbData.websiteOneData} />
        </main>
    );
}