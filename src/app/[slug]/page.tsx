import { notFound, redirect } from "next/navigation";
import { getWebsiteData } from "@/lib/get-website";
import { headers } from "next/headers";
import WebsiteOne from "@/components/templates/WebsiteOne";

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

  // Domain & URL Resolution
  const domain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.online`;

  // Visual Assets
  const defaultLogo = templateData?.navbar?.logo?.src || "";
  const faviconUrl = settings.faviconLight || settings.favicon || defaultLogo;
  const cacheBusterUrl = faviconUrl ? `${faviconUrl}?v=${new Date().getTime()}` : "/favicon.ico";
  const ogImage = settings.ogImage || defaultLogo;

  // Core Metadata Strings
  const siteTitle = settings.seoTitle || settings.businessName || data.clientName || slug;
  const siteDescription = settings.seoDescription || "Expert local pet care and grooming services.";
  const businessName = settings.businessName || data.clientName || slug;

  return {
    title: siteTitle,
    description: siteDescription,
    keywords: settings.keywords || "",
    metadataBase: new URL(domain),
    alternates: { canonical: '/' },
    
    // Favicons & Apple Touch Icons
    icons: {
      icon: cacheBusterUrl,
      shortcut: cacheBusterUrl,
      apple: settings.appleTouchIcon || cacheBusterUrl,
    },
    
    // Search Engine Crawling Rules
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

    // Rich OpenGraph (Facebook, LinkedIn, iMessage)
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

    // Rich Twitter Cards
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
  const headersList = await headers();
  const currentPath = headersList.get('x-invoke-path') || '/';
  
  if (settings.redirects && settings.redirects.length > 0) {
      const match = settings.redirects.find((r: any) => r.oldPath === currentPath);
      if (match) redirect(match.newPath); 
  }

  // ==========================================
  // 🔥 ADVANCED LOCAL BUSINESS SCHEMA (JSON-LD)
  // ==========================================
  const domain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.online`;
  
  // Extract social links from the footer to add to Google's Knowledge Graph
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
    // Dynamically uses your format: "Mo-Su 09:00-17:00"
    "openingHours": settings.businessHours || "",
    "priceRange": "$$",
    "sameAs": sameAsLinks
  };

  const htmlClasses = [];
  if (settings.accessibilityReducedMotion) htmlClasses.push("motion-reduce");

  return (
    <div id="tenant-wrapper" lang={settings.language || "en"} dir={settings.rtlLayout ? "rtl" : "ltr"} className={htmlClasses.join(" ")}>
      <main className="w-full min-h-screen">
        
        {/* 🔥 Invisible SEO Injection */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
        />

        <TemplateComponent data={templateData} slug={slug} />
        
        {/* Third Party Integrations */}
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