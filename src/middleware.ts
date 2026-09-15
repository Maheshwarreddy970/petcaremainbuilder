import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  // Matches all routes except api, _next, static files, and files with extensions
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  let hostname = req.headers.get("X-Subdomain-Host") || req.headers.get("host") || "";
  hostname = hostname.replace("www.", ""); 

  // 🔥 ADDED nexpetcare.com to your core platform domains
  const mainDomains = ["localhost:3000", "nexpetcare.online", "nexpetcare.com"];

  const isOnlineSubdomain = hostname.endsWith(".nexpetcare.online");
  const isComSubdomain = hostname.endsWith(".nexpetcare.com");

  // 1. SUBDOMAIN ROUTING (e.g., m.nexpetcare.online OR m.nexpetcare.com)
  if ((isOnlineSubdomain || isComSubdomain) && !mainDomains.includes(hostname)) {
    
    let subdomain = hostname;
    if (isOnlineSubdomain) subdomain = hostname.replace(".nexpetcare.online", "");
    if (isComSubdomain) subdomain = hostname.replace(".nexpetcare.com", "");
    
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  // 2. CUSTOM DOMAIN ROUTING (e.g., nexpetcare.store)
  if (!mainDomains.includes(hostname)) {
    // Rewrite directly to the /[slug] route, passing the domain name as the slug
    return NextResponse.rewrite(new URL(`/${hostname}${url.pathname}`, req.url));
  }

  // 3. MAIN DOMAIN FALLBACK (nexpetcare.online OR nexpetcare.com)
  return NextResponse.next();
}