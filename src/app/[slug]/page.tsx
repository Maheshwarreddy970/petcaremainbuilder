import { notFound, redirect } from "next/navigation";
import { getWebsiteData } from "@/lib/get-website";
import { headers } from "next/headers";

// Import all templates
import WebsiteOne from "@/components/templates/WebsiteOne";

const TEMPLATES: Record<string, React.FC<any>> = {
  websiteOne: WebsiteOne,
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getWebsiteData(slug);
  const settings = data?.settings || {};

  // Build canonical URL for SEO
  const domain = data?.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.online`;

  // Grab the template data to find the user's logo
  const templateId = data?.template || "websiteOne";
  const templateData = templateId === "websiteOne" ? data?.websiteOneData : data?.websiteTwoData;

  // 🔥 SMART FAVICON LOGIC:
  // 1. Use the favicon from Settings.
  // 2. If empty, fallback to the Navbar Logo.
  // 3. If that's empty, use your default Petocare Logo (NEVER use /favicon.ico)
  const defaultLogo = templateData?.navbar?.logo?.src || "https://res.cloudinary.com/doscyny4j/image/upload/0cGSckUnYfQekLfhg0llimhDCf4_bdsxhs.png";
  const faviconUrl = settings.faviconLight || settings.favicon || defaultLogo;

  // 🔥 CACHE BUSTER: Forces the browser to immediately drop the Vercel icon and load this one
  const cacheBusterUrl = `${faviconUrl}?v=${new Date().getTime()}`;

  return {
    title: settings.seoTitle || `${data?.clientName || slug} | NexPet Care`,
    description: settings.seoDescription || "Expert pet care and grooming services.",
    keywords: settings.keywords || "pet care, grooming, local business",
    metadataBase: new URL(domain),
    alternates: {
      canonical: '/',
    },
    // 🔥 FORCED ICONS
    icons: {
      icon: cacheBusterUrl,
      shortcut: cacheBusterUrl,
      apple: cacheBusterUrl,
    },
    openGraph: {
      title: settings.seoTitle || `${data?.clientName || slug} | NexPet Care`,
      description: settings.seoDescription || "Expert pet care and grooming services.",
      url: domain,
      siteName: data?.clientName || slug,
      images: [
        {
          url: settings.ogImage || faviconUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: settings.language || "en_US",
      type: "website",
    },
  };
}

export default async function LiveTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return notFound();

  const data = await getWebsiteData(slug);
  if (!data || !data.isDeployed) return notFound();

  const templateId = data.template || "websiteOne";
  const TemplateComponent = TEMPLATES[templateId];

  if (!TemplateComponent) {
    return <div>Template not found.</div>;
  }

  const templateData = templateId === "websiteOne" ? data.websiteOneData : data.websiteTwoData;
  const settings = data.settings || {};

  // ==========================================
  // 🔥 301 REDIRECTS (Wix / WordPress mapping)
  // ==========================================
  const headersList = await headers();
  const currentPath = headersList.get('x-invoke-path') || '/';

  if (settings.redirects && settings.redirects.length > 0) {
      const match = settings.redirects.find((r: any) => r.oldPath === currentPath);
      if (match) {
          redirect(match.newPath); // Fires a 301 Permanent Redirect instantly
      }
  }

  // ==========================================
  // 🔥 BUILD LOCAL BUSINESS SCHEMA (JSON-LD)
  // ==========================================
  const info = templateData?.footer?.info || {};
  const domain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.online`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": data.clientName || slug,
    "image": settings.ogImage || templateData?.navbar?.logo?.src,
    "@id": domain,
    "url": domain,
    "telephone": info.phone?.label || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": info.address || "",
    },
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  };

  // Check for Reduced Motion Preference
  const htmlClasses = [];
  if (settings.accessibilityReducedMotion) htmlClasses.push("motion-reduce");

  return (
    // 🔥 Used a div wrapper instead of <html> to prevent React Hydration errors
    <div id="tenant-wrapper" lang={settings.language || "en"} dir={settings.rtlLayout ? "rtl" : "ltr"} className={htmlClasses.join(" ")}>
      <main className="w-full min-h-screen">
        
        {/* Inject JSON-LD into the head invisibly */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <TemplateComponent data={templateData} slug={slug} />
        
        {settings.googleAnalyticsId && (
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}></script>
        )}

        {settings.googleReviewsId && (
          <script src="https://apps.elfsight.com/p/platform.js" defer></script>
        )}
        {settings.googleReviewsId && (
          <div className={`elfsight-app-${settings.googleReviewsId}`}></div>
        )}
      </main>
    </div>
  );
}