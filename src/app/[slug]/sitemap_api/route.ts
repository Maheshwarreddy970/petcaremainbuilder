import { NextResponse } from 'next/server';
import { getWebsiteData } from "@/lib/get-website";

// 🔥 Guarantees this runs fresh on every request
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getWebsiteData(slug);

  if (!data) return new NextResponse('Not Found', { status: 404 });

  const domain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.online`;
  const lastMod = data.lastUpdated ? new Date(data.lastUpdated).toISOString() : new Date().toISOString();

  // 1. Core Domain Root
  let urls = `
  <url>
    <loc>${domain}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // 2. Dynamic Sitelinks (Extracted from the user's actual navbar configuration)
  const templateId = data.template || "websiteOne";
  const templateData = templateId === "websiteOne" ? data.websiteOneData : data.websiteTwoData;
  const navLinks = templateData?.navbar?.links || [];

  navLinks.forEach((link: { label: string, href: string }) => {
    // Only index valid internal paths (e.g. /about, /services, or anchored sections /#services)
    if (link.href && link.href !== "#" && link.href !== "#home") {
      
      // Ensure the slash is formatted correctly
      const formattedPath = link.href.startsWith('/') ? link.href : `/${link.href}`;

      urls += `
  <url>
    <loc>${domain}${formattedPath}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  });

  // Compile final XML Document
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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' 
    } 
  });
}