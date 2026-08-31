import React from "react";
import Navbar from "@/components/landingpageone/Navbar";
import Homepage from "@/components/landingpageone/Home";
import StatsBanner from "@/components/landingpageone/ReviewSection";
import ImageSliderSection from "@/components/landingpageone/ImageSliderSection"; 
import GallerySection from "@/components/landingpageone/GallerySection";
import AboutSection from "@/components/landingpageone/AboutSection";
import ServicesSection from "@/components/landingpageone/ServicesSection";
import ProcessSection from "@/components/landingpageone/ProcessSection";
import ComparisonSection from "@/components/landingpageone/ComparisonSection";
import ReviewsSection from "@/components/landingpageone/ReviewsSection";
import InsightsSection from "@/components/landingpageone/InsightsSection";
import FAQSection from "@/components/landingpageone/FAQSection"; 
import ContactSection from "@/components/landingpageone/ContactSection"; 
import CTASection from "@/components/landingpageone/CTASection";
import Footer from "@/components/landingpageone/footer";

export default function WebsiteOne({ data, slug }: { data: any, slug?: string }) {
  if (!data) return null;

  const primaryColor = data?.theme?.primaryColor || "#a35c38";

  // Added a soft drop shadow (feDropShadow) and refined the bezier curves 
  // for a buttery-smooth, premium 3D feel without borders.
  const defaultPawSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g fill="${primaryColor}" filter="url(#softShadow)">
        <circle cx="12" cy="18" r="4.5"/>
        <circle cx="20" cy="11" r="5"/>
        <circle cx="28" cy="11" r="5"/>
        <circle cx="36" cy="18" r="4.5"/>
        <path d="M24 21c-6.5 0-11.5 4.5-11.5 11 0 4.5 4.5 8 11.5 8s11.5-3.5 11.5-8c0-6.5-5-11-11.5-11z"/>
      </g>
    </svg>
  `);

  // The hover state gently expands the toes and deepens the shadow
  // to create a smooth "press" illusion without jumping.
  const hoverPawSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <defs>
        <filter id="hoverShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g fill="${primaryColor}" filter="url(#hoverShadow)">
        <circle cx="11" cy="17" r="5"/>
        <circle cx="19" cy="10" r="5.5"/>
        <circle cx="29" cy="10" r="5.5"/>
        <circle cx="37" cy="17" r="5"/>
        <path d="M24 20c-7.2 0-12.5 5-12.5 12 0 5 5 8.5 12.5 8.5s12.5-3.5 12.5-8.5c0-7-5.2-12-12.5-12z"/>
      </g>
    </svg>
  `);

  return (
    <div 
      id="live-preview-box"
      className="relative w-full min-h-screen bg-white font-sans text-gray-900"
    >
      <style>{`
        /* Smooth scrolling for the whole page */
        html {
          scroll-behavior: smooth;
        }

        /* 
          Aligning the click hotspot perfectly between the top two toes (24 12) 
          so clicking feels highly accurate and doesn't jump.
        */
        body, input, textarea, select {
          cursor: url("data:image/svg+xml;utf8,${defaultPawSvg}") 24 12, auto !important;
        }

        a, button, [role='button'], input[type='submit'], input[type='button'], summary {
          cursor: url("data:image/svg+xml;utf8,${hoverPawSvg}") 24 12, pointer !important;
          /* Adding smooth CSS transitions to interactive elements makes the cursor interaction feel smoother overall */
          transition: all 0.25s ease-in-out;
        }
      `}</style>

      {data.navbar && <Navbar data={data.navbar} />}
      {data.hero && <Homepage data={data.hero} />}
      {data.statsBanner && <StatsBanner data={data.statsBanner} />}      
      {data.imageSlider && <ImageSliderSection data={data.imageSlider} />}
      {data.gallery && <GallerySection data={data.gallery} />}
      {data.about && <AboutSection data={data.about} />}
      {data.services && <ServicesSection data={data.services} />}
      {data.process && <ProcessSection data={data.process} />}
      {data.comparison && <ComparisonSection data={data.comparison} />}
      {data.reviews && <ReviewsSection data={data.reviews} />}
      {data.insights && <InsightsSection data={data.insights} />}
      {data.faq && <FAQSection data={data.faq} />}
      {data.contactSection && <ContactSection data={data.contactSection} slug={slug} />}
      {data.ctaSection && <CTASection data={data.ctaSection} />}
      {data.footer && <Footer data={data.footer} />}
    </div>
  );
}