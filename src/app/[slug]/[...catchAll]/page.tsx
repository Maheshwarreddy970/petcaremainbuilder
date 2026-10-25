import { permanentRedirect } from "next/navigation";

export default function CatchAllRoutes() {
  // 🔥 permanentRedirect issues a 308 Permanent Redirect 
  // (The modern, stricter version of a 301 that Google prefers for SEO)
  permanentRedirect("/");
}