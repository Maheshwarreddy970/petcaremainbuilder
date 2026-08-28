import React from "react";
import Navbar from "@/components/landingpageone/Navbar";
import Homepage from "@/components/landingpageone/Home";
import StatsBanner from "@/components/landingpageone/ReviewSection";
import ImageSliderSection from "@/components/landingpageone/ImageSliderSection"; // 🔥 NEW
import GallerySection from "@/components/landingpageone/GallerySection";
import AboutSection from "@/components/landingpageone/AboutSection";
import ServicesSection from "@/components/landingpageone/ServicesSection";
import ProcessSection from "@/components/landingpageone/ProcessSection";
import ComparisonSection from "@/components/landingpageone/ComparisonSection";
import ReviewsSection from "@/components/landingpageone/ReviewsSection";
import InsightsSection from "@/components/landingpageone/InsightsSection";
import FAQSection from "@/components/landingpageone/FAQSection"; // 🔥 NEW
import ContactSection from "@/components/landingpageone/ContactSection"; 
import CTASection from "@/components/landingpageone/CTASection";
import Footer from "@/components/landingpageone/footer";

// 🔥 Added slug to the props so the Contact form knows who to email!
export default function WebsiteOne({ data, slug }: { data: any, slug?: string }) {
  if (!data) return null;
  return (
    <div 
      id="live-preview-box"
      className="relative w-full min-h-screen bg-white font-sans text-gray-900"
    >
      {data.navbar && <Navbar data={data.navbar} />}
      {data.hero && <Homepage data={data.hero} />}
      {data.statsBanner && <StatsBanner data={data.statsBanner} />}      
      {data.gallery && <GallerySection data={data.gallery} />}
      {data.about && <AboutSection data={data.about} />}
      {data.services && <ServicesSection data={data.services} />}
      {data.process && <ProcessSection data={data.process} />}
      {data.comparison && <ComparisonSection data={data.comparison} />}
      {data.reviews && <ReviewsSection data={data.reviews} />}
      {data.imageSlider && <ImageSliderSection data={data.imageSlider} />}
      {data.insights && <InsightsSection data={data.insights} />}

      {data.faq && <FAQSection data={data.faq} />}

      {data.contactSection && <ContactSection data={data.contactSection} slug={slug} />}

      {data.ctaSection && <CTASection data={data.ctaSection} />}
      {data.footer && <Footer data={data.footer} />}
    </div>
  );
}