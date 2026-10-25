import { redirect } from "next/navigation";

export default function CatchAllRoutes() {
  // 🔥 Automatically catches broken Shopify/WordPress links (e.g., /products, /cart)
  // and issues a 301 Permanent Redirect to the client's new homepage.
  redirect("/");
}