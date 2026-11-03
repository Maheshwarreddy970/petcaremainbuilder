import { NextResponse } from 'next/server';

// =======================================================================
// 🔥 CACHING IMPLEMENTED: Cache for 1 year to ensure 0 CPU usage
// =======================================================================
export const revalidate = 31536000; 
export const dynamicParams = true;  

export async function generateStaticParams() {
  // Returning an empty array forces Next.js to treat this as a STATIC route
  return [];
}
// =======================================================================

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Resolve whether this is a custom domain or a subdomain
  const domain = slug.includes('.') ? `https://${slug}` : `https://${slug}.nexpetcare.online`;

  const robots = `User-agent: *
Allow: /
Sitemap: ${domain}/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate'
    }
  });
}