import { notFound, permanentRedirect } from "next/navigation";
import { getWebsiteData } from "@/lib/get-website";
import WebsiteOne from "@/components/templates/WebsiteOne";

// 🔥 CRITICAL FIX 1: Tell Next.js to cache the HTML of this dynamic route on the Edge CDN for 1 year!
// (Your Publish button's 'revalidatePath' will instantly break this cache when needed).
export const revalidate = 31536000; 

const TEMPLATES: Record<string, React.FC<any>> = {
  websiteOne: WebsiteOne,
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getWebsiteData(slug);
  if (!data) return {};

  const settings = data.settings || {};
  const templateId = data.template || "websiteOne";
  const templateData = templateId === "websiteOne" ? data.websiteOneData : data.websiteTwoData;

  const domain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.online`;

  const defaultLogo = templateData?.navbar?.logo?.src || "";
  const faviconUrl = settings.faviconLight || settings.favicon || defaultLogo;
  const cacheBusterUrl = faviconUrl ? `${faviconUrl}?v=${new Date().getTime()}` : "/favicon.ico";
  const ogImage = settings.ogImage || defaultLogo;

  const siteTitle = settings.seoTitle || settings.businessName || data.clientName || slug;
  const siteDescription = settings.seoDescription || "Expert local pet care and grooming services.";
  const businessName = settings.businessName || data.clientName || slug;

  return {
    title: siteTitle,
    description: siteDescription,
    keywords: settings.keywords || "",
    metadataBase: new URL(domain),
    alternates: { canonical: '/' },
    
    icons: {
      icon: cacheBusterUrl,
      shortcut: cacheBusterUrl,
      apple: settings.appleTouchIcon || cacheBusterUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: domain,
      siteName: businessName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: businessName }] : [],
      locale: settings.language?.replace("-", "_") || "en_US",
      type: "website",
      emails: settings.businessEmail ? [settings.businessEmail] : [],
      phoneNumbers: settings.businessPhone ? [settings.businessPhone] : [],
    },

    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: ogImage ? [ogImage] : [],
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

  if (!TemplateComponent) return <div>Template not found.</div>;

  const templateData = templateId === "websiteOne" ? data.websiteOneData : data.websiteTwoData;
  const settings = data.settings || {};

  // ==========================================
  // 🔥 301 REDIRECTS 
  // ==========================================
  const currentPath = '/';

  if (settings.redirects && settings.redirects.length > 0) {
      const match = settings.redirects.find((r: any) => r.oldPath === currentPath);
      if (match) permanentRedirect(match.newPath); 
  }

  const domain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.online`;
  
  const socialsObj = templateData?.footer?.socials || {};
  const sameAsLinks = Object.values(socialsObj).filter((url: any) => url && url !== "#");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": settings.businessName || data.clientName || slug,
    "image": settings.ogImage || templateData?.navbar?.logo?.src || "",
    "@id": domain,
    "url": domain,
    "telephone": settings.businessPhone || "",
    "email": settings.businessEmail || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings.businessAddress || "",
    },
    "openingHours": settings.businessHours || "",
    "priceRange": "$$",
    "sameAs": sameAsLinks
  };

  const htmlClasses = [];
  if (settings.accessibilityReducedMotion) htmlClasses.push("motion-reduce");

  return (
    <div id="tenant-wrapper" lang={settings.language || "en"} dir={settings.rtlLayout ? "rtl" : "ltr"} className={htmlClasses.join(" ")}>
      <main className="w-full min-h-screen">
        
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