"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { 
  Home, 
  Briefcase, 
  Calendar, 
  Dog, 
  User, 
  Image as GalleryIcon, 
  Star, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import PawIcon from "@/icons/icon1"; 
import { cn } from "@/lib/utils";

// 🚀 Dynamic Icon Lookup Map
const ICON_MAP: Record<string, any> = {
  Home: Home,
  Calendar: Calendar,
  Gallery: GalleryIcon,
  Image: GalleryIcon,
  Briefcase: Briefcase,
  Dog: Dog,
  User: User,
  Reviews: Star,
  Star: Star,
  MessageSquare: MessageSquare,
  Sparkles: Sparkles,
};

export default function Navbar({ data }: { data: any }) {
  const pathname = usePathname();
  const { ref, inView } = useInView({ threshold: 0, initialInView: true });
  const isScrolled = !inView;

  // 🚀 Track URL Hash for `#gallery`, `#services`, `#reviews`, etc.
  const [activeHash, setActiveHash] = useState("");
useEffect(() => {
    // Scroll-Spy Logic
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let currentSectionId = "";

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = section.clientHeight;
        
        // If the scroll position is within this section
        if (window.scrollY >= sectionTop - 150 && window.scrollY < sectionTop + sectionHeight - 150) {
          currentSectionId = `#${section.id}`;
        }
      });

      // Also support clicking directly via hash
      if (window.scrollY === 0) currentSectionId = "/";
      
      if (currentSectionId && currentSectionId !== activeHash) {
        setActiveHash(currentSectionId);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeHash]);

  if (!data) return null;

  const logo = data.logo || { src: "", alt: "Logo" };
  const links = data.links || [];

  const getIcon = (iconName?: string, fallbackIndex: number = 0) => {
    if (!iconName) {
      const fallbacks = [Home, GalleryIcon, Briefcase, Dog, Star];
      return fallbacks[fallbackIndex % fallbacks.length];
    }
    const cleanName = iconName.trim();
    return ICON_MAP[cleanName] || ICON_MAP[cleanName.charAt(0).toUpperCase() + cleanName.slice(1)] || Star;
  };

  return (
    <>
      <div ref={ref} className="absolute top-0 left-0 w-full h-screen pointer-events-none -z-10 bg-transparent" />

      {/* DESKTOP TOP NAVIGATION */}
      <nav 
        className="hidden md:block fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{ 
          backgroundColor: isScrolled ? `${data.bg}E6` : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          '--nav-link': data.linkColor || '#625b5b',
          '--nav-hover': data.linkHoverColor || '#1e0c05'
        } as React.CSSProperties}
      >
        <div className="px-6 md:px-12 lg:px-24 xl:px-40 py-3 flex items-center justify-between relative">
          
          {/* LOGO */}
          <a href={data.cta?.href || "/"} className="relative flex items-center justify-start w-40 h-12">
            {logo.src ? (
              <img
                src={logo.src}
                alt={logo.alt || "Business Logo"}
                className="h-full w-auto max-w-full object-contain object-left transition-all" 
              />
            ) : (
              <PawIcon className="h-11 w-11" style={{ color: data.cta?.bg }} />
            )}
          </a>

          {/* DYNAMIC NAVIGATION LINKS */}
          <div 
            className="flex items-center rounded-full px-1 py-1 gap-2 shadow-sm border"
            style={{ backgroundColor: data.bg, borderColor: data.linkHoverColor + '20' }}
          >
            {links.length > 0 ? (
              links.map((link: any, index: number) => {
                const cleanHref = (link.href || "").trim();
                const isActive = cleanHref === "/" || cleanHref === ""
                  ? (pathname === "/" && (!activeHash || activeHash === "#" || activeHash === "/"))
                  : activeHash === cleanHref;

                return (
                  <a
                    key={index}
                    href={cleanHref}
                    onClick={() => setActiveHash(cleanHref)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm transition-all duration-200"
                    )}
                    style={{
                      backgroundColor: isActive ? `${data.linkHoverColor}10` : 'transparent',
                      color: isActive ? data.linkHoverColor : 'var(--nav-link)',
                      fontWeight: isActive ? 500 : 400
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = data.linkHoverColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = isActive ? data.linkHoverColor : data.linkColor}
                  >
                    {link.label}
                  </a>
                );
              })
            ) : (
              <span className="px-4 py-1 text-sm opacity-50">Add links in editor</span>
            )}
          </div>

          {/* CTA BUTTON */}
          <a 
            href={data.cta?.href || "#"} 
            className="flex items-center gap-2.5 text-sm font-medium pl-5 pr-2 py-2 rounded-full cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: data.cta?.bg, color: data.cta?.text }}
          >
            {data.cta?.label || "Schedule"}
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke={data.cta?.text || "#ffffff"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </nav>

      {/* MOBILE TOP HEADER */}
      <div 
        className={cn("fixed top-0 left-0 w-full z-40 p-4 transition-all duration-300 md:hidden")}
        style={{ 
          backgroundColor: isScrolled ? `${data.bg}E6` : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none'
        }}
      >
        <a href="/" className="relative flex items-center w-32 h-10">
          {logo.src ? (
            <img src={logo.src} alt={logo.alt || "Business Logo"} className="h-full w-auto max-w-full object-contain object-left transition-all" />
          ) : (
            <PawIcon className="h-10 w-10" style={{ color: data.cta?.bg }} />
          )}
        </a>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav 
        className="md:hidden fixed inset-x-0 bottom-4 mx-auto z-50 w-fit max-w-[95vw] border rounded-full flex items-center p-1.5 shadow-xl space-x-1"
        style={{ backgroundColor: data.bg, borderColor: data.linkHoverColor + '20' }}
      >
        {links.slice(0, 5).map((link: any, index: number) => {
          const cleanHref = (link.href || "").trim();
          const Icon = getIcon(link.icon, index);

          // Checks active status against Hash or Pathname
          const isActive = cleanHref === "/" || cleanHref === ""
            ? (pathname === "/" && (!activeHash || activeHash === "#" || activeHash === "/"))
            : activeHash === cleanHref;

          return (
            <a 
              key={index} 
              href={cleanHref} 
              onClick={() => setActiveHash(cleanHref)}
              className={cn(
                "flex items-center gap-0 px-3 py-2 rounded-full transition-all duration-300 relative h-10 min-w-[44px]", 
                isActive ? "gap-2 px-3.5" : ""
              )}
              style={{
                backgroundColor: isActive ? `${data.linkHoverColor}10` : 'transparent',
                color: isActive ? data.linkHoverColor : data.linkColor
              }}
            >
              <Icon size={20} strokeWidth={2} className="flex-shrink-0" />
              <div 
                className="overflow-hidden flex items-center transition-all duration-300 ease-in-out" 
                style={{ 
                  width: isActive ? "64px" : "0px", 
                  opacity: isActive ? 1 : 0, 
                  marginLeft: isActive ? "4px" : "0px" 
                }}
              >
                <span className="font-medium text-xs capitalize whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
                  {link.label?.trim()}
                </span>
              </div>
            </a>
          );
        })}
      </nav>
    </>
  );
}