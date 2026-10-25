import { NextResponse } from 'next/server';
import { getWebsiteData } from "@/lib/get-website";

// 🔥 CRITICAL FIX: Match the 1-year cache rule used in your page.tsx. 
// Vercel will cache this XML file on the Edge Network instantly.
export const revalidate = 31536000; 
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getWebsiteData(slug);

  if (!data) return new NextResponse('Not Found', { status: 404 });

  // Clean domain URL (ensure no accidental double slashes)
  const rawDomain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.com`;
  const domain = rawDomain.replace(/\/$/, ""); 
  
  const lastMod = data.lastUpdated ? new Date(data.lastUpdated).toISOString() : new Date().toISOString();

  // 1. Core Domain Root
  let urls = `
  <url>
    <loc>${domain}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // 2. Dynamic Sitelinks (Extracted from the user's actual navbar configuration)
  const templateId = data.template || "websiteOne";
  const templateData = templateId === "websiteOne" ? data.websiteOneData : data.websiteTwoData;
  const navLinks = templateData?.navbar?.links || [];

  // Track added paths to prevent duplicate entries in the XML
  const addedPaths = new Set<string>();
  addedPaths.add("/");

  navLinks.forEach((link: { label: string, href: string }) => {
    const href = link.href || "";
    
    // 🔥 SEO FIX: Filter out all anchor links (#services) and external links (https://...)
    // Google Search Console will flag your sitemap as invalid if you include them.
    if (href && !href.startsWith('#') && !href.startsWith('http')) {
      
      const formattedPath = href.startsWith('/') ? href : `/${href}`;
      
      // Ensure we haven't already added this exact URL
      if (!addedPaths.has(formattedPath)) {
        urls += `
  <url>
    <loc>${domain}${formattedPath}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        addedPaths.add(formattedPath);
      }
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${urls}
</urlset>`;

  return new NextResponse(sitemap, { 
    headers: { 
      'Content-Type': 'application/xml',
      // Allow CDN edge caching for 1 year
      'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate' 
    } 
  });
}