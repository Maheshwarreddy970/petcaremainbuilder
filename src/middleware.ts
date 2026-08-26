import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  // Matches all routes except api, _next, static files, and files with extensions (like .jpg, .ico)
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // 1. Read header injected by Cloudflare Worker first, then fallback to host
  let hostname = req.headers.get("X-Subdomain-Host") || req.headers.get("host") || "";
  hostname = hostname.replace("www.", ""); 

  const mainDomains = ["localhost:3000", "nexpetcare.online"];

  // ==========================================
  // 🚀 301 REDIRECTS (SEO PROTECTION)
  // If you store redirects in Vercel Edge Config or pass them from Cloudflare, 
  // you intercept the old Wix paths right here before rendering anything:
  // 
  // if (url.pathname === "/old-wix-services-page") {
  //   return NextResponse.redirect(new URL("/services", req.url), 301);
  // }
  // ==========================================


  // 2. SUBDOMAIN ROUTING (e.g., doggieteethcleaning.nexpetcare.online)
  if (hostname.endsWith(".nexpetcare.online") && !mainDomains.includes(hostname)) {
    const subdomain = hostname.replace(".nexpetcare.online", "");
    
    // Rewrite path to target app/[slug]/page.tsx internally
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }


  // 3. CUSTOM DOMAIN ROUTING (e.g., fluffys-salon.com)
  if (!mainDomains.includes(hostname)) {
    // Rewrite path to target app/live/domain/[hostname]/page.tsx
    return NextResponse.rewrite(new URL(`/live/domain/${hostname}${url.pathname}`, req.url));
  }


  // 4. MAIN DOMAIN FALLBACK (e.g., nexpetcare.online)
  // Just let the request pass through normally to your landing page/dashboard
  return NextResponse.next();
}