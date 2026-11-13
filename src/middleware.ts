import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico|css|js|woff|woff2|ttf)).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // ==========================================
  // 🔥 1. THE BOT SHIELD 
  // Instantly blocks automated hackers/scanners without wasting Vercel CPU
  // ==========================================
  const blockedPaths = [".env", ".php", ".yml", ".yaml", ".sql", ".git", ".bak", "wp-admin", "wp-includes", "phpmyadmin"];
  if (blockedPaths.some(path => url.pathname.toLowerCase().includes(path))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let hostname = req.headers.get("X-Subdomain-Host") || req.headers.get("host") || "";
  hostname = hostname.replace("www.", "");

  const mainDomains = ["localhost:3000", "nexpetcare.online", "nexpetcare.com"];
  const isVercel = hostname.endsWith(".vercel.app");

  // 2. LOCALHOST ROUTING
  if (hostname.includes(".localhost:3000") || hostname.includes(".localhost")) {
    const subdomain = hostname.split(".")[0];
    
    if (url.pathname === '/sitemap.xml') return NextResponse.rewrite(new URL(`/${subdomain}/sitemap_api`, req.url));
    
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  // 3. SUBDOMAIN ROUTING (e.g., m.nexpetcare.online)
  if (hostname.endsWith(".nexpetcare.online") && !mainDomains.includes(hostname)) {
    const subdomain = hostname.replace(".nexpetcare.online", "");
    
    if (url.pathname === '/sitemap.xml') return NextResponse.rewrite(new URL(`/${subdomain}/sitemap_api`, req.url));
    if (url.pathname === '/robots.txt') return NextResponse.rewrite(new URL(`/${subdomain}/robots.txt`, req.url));
    
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  // 4. CUSTOM DOMAIN ROUTING (e.g., doggieteethcleaning.ca)
  if (!mainDomains.includes(hostname) && !isVercel) {
    
    if (url.pathname === '/sitemap.xml') return NextResponse.rewrite(new URL(`/${hostname}/sitemap_api`, req.url));
    if (url.pathname === '/robots.txt') return NextResponse.rewrite(new URL(`/${hostname}/robots.txt`, req.url));
    
    return NextResponse.rewrite(new URL(`/${hostname}${url.pathname}`, req.url));
  }

  // 5. MAIN DOMAIN FALLBACK
  return NextResponse.next();
}