import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  // 🔥 UPDATED MATCHER: We only ignore actual static assets like images, css, and js.
  // This allows .xml and .json requests to correctly pass through to our catch-all and sitemap APIs!
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico|css|js|woff|woff2|ttf)).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  let hostname = req.headers.get("X-Subdomain-Host") || req.headers.get("host") || "";
  hostname = hostname.replace("www.", ""); 

  // Make sure to include both your domains
  const mainDomains = ["localhost:3000", "nexpetcare.online", "nexpetcare.com"];
  const isVercel = hostname.endsWith(".vercel.app");

  // 1. LOCALHOST ROUTING
  if (hostname.includes(".localhost:3000") || hostname.includes(".localhost")) {
    const subdomain = hostname.split(".")[0];
    
    // 🔥 Explicitly route sitemap.xml to our generator API
    if (url.pathname === '/sitemap.xml') return NextResponse.rewrite(new URL(`/${subdomain}/sitemap_api`, req.url));
    
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  // 2. SUBDOMAIN ROUTING (e.g., m.nexpetcare.online)
  if (hostname.endsWith(".nexpetcare.online") && !mainDomains.includes(hostname)) {
    const subdomain = hostname.replace(".nexpetcare.online", "");
    
    if (url.pathname === '/sitemap.xml') return NextResponse.rewrite(new URL(`/${subdomain}/sitemap_api`, req.url));
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  // 3. CUSTOM DOMAIN ROUTING (e.g., doggieteethcleaning.ca)
  if (!mainDomains.includes(hostname) && !isVercel) {
    
    if (url.pathname === '/sitemap.xml') return NextResponse.rewrite(new URL(`/${hostname}/sitemap_api`, req.url));
    return NextResponse.rewrite(new URL(`/${hostname}${url.pathname}`, req.url));
  }

  // 4. MAIN DOMAIN FALLBACK
  return NextResponse.next();
}