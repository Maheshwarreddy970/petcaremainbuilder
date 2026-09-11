import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  let hostname = req.headers.get("X-Subdomain-Host") || req.headers.get("host") || "";
  hostname = hostname.replace("www.", ""); 

  const mainDomains = ["localhost:3000", "nexpetcare.online"];

  // 1. SUBDOMAIN ROUTING (e.g., m.nexpetcare.online)
  if (hostname.endsWith(".nexpetcare.online") && !mainDomains.includes(hostname)) {
    const subdomain = hostname.replace(".nexpetcare.online", "");
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  // 🔥 2. CUSTOM DOMAIN ROUTING (e.g., nexpetcare.store)
  if (!mainDomains.includes(hostname)) {
    // We rewrite the path directly to app/[slug] so everything uses one layout!
    return NextResponse.rewrite(new URL(`/${hostname}${url.pathname}`, req.url));
  }

  // 3. MAIN DOMAIN FALLBACK (e.g., nexpetcare.online)
  return NextResponse.next();
}