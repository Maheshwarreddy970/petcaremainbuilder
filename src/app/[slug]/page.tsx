import { notFound } from "next/navigation";
import { getWebsiteData } from "@/lib/get-website";

// Import all future templates here
import WebsiteOne from "@/components/templates/WebsiteOne";
// import WebsiteTwo from "@/components/templates/WebsiteTwo";

// Create a template dictionary
const TEMPLATES: Record<string, React.FC<any>> = {
  websiteOne: WebsiteOne,
  // websiteTwo: WebsiteTwo,
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getWebsiteData(slug);
  const settings = data?.settings || {};

  return {
    title: settings.seoTitle || `${slug} | NexPet Care`,
    description: settings.seoDescription || "Built with NexPet Care",
    keywords: settings.keywords || "pet care, grooming",
    icons: {
      icon: settings.favicon || "/favicon.ico",
    },
    openGraph: {
      images: [settings.ogImage || "https://nexpetcare.online/default-og.jpg"],
    },
  };
}

export default async function LiveTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return notFound();

  const data = await getWebsiteData(slug);
  if (!data || !data.isDeployed) return notFound();

  // Dynamically select the template based on DB value, fallback to WebsiteOne
  const templateId = data.template || "websiteOne";
  const TemplateComponent = TEMPLATES[templateId];

  if (!TemplateComponent) {
    return <div>Template not found. Please select a valid template.</div>;
  }

  // Determine which data object to pass based on template
  const templateData = templateId === "websiteOne" ? data.websiteOneData : data.websiteTwoData;

  return (
    <main className="w-full min-h-screen">
      <TemplateComponent data={templateData} />
      
      {data.settings?.googleAnalyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${data.settings.googleAnalyticsId}`}></script>
      )}
      
      {data.settings?.googleReviewsId && (
         <script src="https://apps.elfsight.com/p/platform.js" defer></script>
      )}
      {data.settings?.googleReviewsId && (
         <div className={`elfsight-app-${data.settings.googleReviewsId}`}></div>
      )}
    </main>
  );
}