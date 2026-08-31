import React from 'react';
import { cn } from '@/lib/utils';
import SmartHeading from '../ui/SmartHeading';
import { ArrowRight } from 'lucide-react'; // Keep ArrowRight for the buttons

// 🔥 Imported all the highly specific pet service icons from react-icons
import { IoCutSharp } from "react-icons/io5";
import { GiFrontTeeth, GiShower, GiComb, GiBarbedNails, GiToothbrush } from "react-icons/gi";
import { LuBrush, LuWind } from "react-icons/lu";
import { PiBathtubFill, PiPawPrintLight, PiCatLight, PiSprayBottleLight } from "react-icons/pi";
import { FaEarListen, FaSprayCanSparkles, FaBottleDroplet } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";

// 🔥 The Smart Mapper: Connects service names/descriptions to the perfect icon
const iconMappings = [
    { keywords: ['haircut', 'cut', 'scissor', 'trim', 'styling', 'shave'], component: IoCutSharp },
    { keywords: ['bath', 'tub', 'wash', 'cleansing', 'shampoo'], component: PiBathtubFill },
    { keywords: ['shower', 'rinse'], component: GiShower },
    { keywords: ['dry', 'blow dry', 'wind', 'blow'], component: LuWind },
    { keywords: ['nail', 'clipping', 'claw', 'paw'], component: GiBarbedNails },
    { keywords: ['ear', 'infection', 'deaf'], component: FaEarListen },
    { keywords: ['brushing', 'brush', 'coat'], component: LuBrush },
    { keywords: ['comb', 'matting', 'dematting'], component: GiComb },
    { keywords: ['flea', 'tick', 'spray', 'perfume'], component: FaSprayCanSparkles },
    { keywords: ['skin', 'treatment', 'nourishing', 'conditioner', 'balm'], component: FaBottleDroplet },
    { keywords: ['teeth brushing', 'toothbrush', 'paste'], component: GiToothbrush },
    { keywords: ['teeth', 'dental', 'plaque', 'tartar', 'mouth', 'scaling', 'smile'], component: GiFrontTeeth },
    { keywords: ['cat', 'feline', 'kitten'], component: PiCatLight },
    { keywords: ['health', 'care', 'protect', 'safe'], component: FiHeart },
];

// Fallback sequence if no keywords match
const fallbackIcons = [PiPawPrintLight, FiHeart, LuBrush, PiBathtubFill];

const getIconForService = (service: any) => {
    const searchString = `${service.title || ''} ${service.description || ''} ${service.iconKey || ''}`.toLowerCase();
    for (const mapping of iconMappings) {
        if (mapping.keywords.some(keyword => searchString.includes(keyword))) return mapping.component;
    }
    return fallbackIcons[(service.title?.length || 0) % fallbackIcons.length];
};

export default function ServicesSection({ data }: { data: any }) {
    if (!data) return null;

    const services = data.items || [];
    const getGridClasses = (count: number) => {
        switch (count) {
            case 1: return "grid-cols-1 max-w-md mx-auto";
            case 2: return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto";
            case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto";
            default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
        }
    };

    return (
        <section id='services' className={cn("py-24 w-full overflow-hidden", data.section?.className)} style={{ backgroundColor: data.section?.bg || data.bg }}>
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">

                <div className="flex flex-col items-center text-center max-w-[620px] mb-16">
                    <SmartHeading
                        as="h2"
                        text={data.heading?.text || data.heading}
                        className={cn("font-medium text-4xl md:text-[48px] leading-[1.2] tracking-[-1.5px] mb-5", data.heading?.className)}
                        style={{ color: data.heading?.color || data.headingColor }}
                    />
                    <p className={cn("text-base md:text-[18px] leading-[1.6]", data.description?.className)} style={{ color: data.description?.color || data.descColor }}>
                        {data.description?.text || data.description || ""}
                    </p>
                </div>

                <div className={cn("grid gap-6 w-full mb-12", getGridClasses(services.length))}>
                    {services.map((service: any, index: number) => {
                        const Icon = getIconForService(service);
                        const hasValidLink = service.href && service.href.trim() !== "" && service.href.trim() !== "#";

                        return (
                            <div key={index} className={cn("h-full", service.className)}>
                                <div
                                    className={cn("group flex flex-col h-full border rounded-3xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white")}
                                    style={{
                                        backgroundColor: data.styling?.cardBg || data.cardBg,
                                        borderColor: data.styling?.cardBorder || data.cardBorder || "#e5e7eb"
                                    }}
                                >
                                    <div className="mb-6">
                                        {/* 🔥 react-icons scale beautifully using text sizing/w-h classes */}
                                        <Icon className="w-11 h-11 transition-transform group-hover:scale-110 duration-300" style={{ color: data.styling?.iconColor || data.iconColor }} />
                                    </div>

                                    {/* Content Wrapper */}
                                    <div className="flex flex-col flex-grow">
                                        <h3 className="font-semibold text-[22px] leading-[1.3] mb-3" style={{ color: data.styling?.titleColor || data.titleColor }}>
                                            {service.title}
                                        </h3>
                                        <p className="text-[15px] leading-[1.6] mb-6 flex-grow" style={{ color: data.description?.color || data.descColor }}>
                                            {service.description}
                                        </p>

                                        {service.priceLabel && (
                                            <div className="font-semibold text-[15px] mb-6" style={{ color: data.styling?.priceColor || data.priceColor }}>
                                                {service.priceLabel}
                                            </div>
                                        )}

                                        {/* SMART BUTTON LOGIC */}
                                        {service.ctaLabel && (
                                            hasValidLink ? (
                                                <a
                                                    href={service.href}
                                                    className="mt-auto flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-[15px] w-full transition-all duration-300 hover:opacity-90 shadow-sm"
                                                    style={{ backgroundColor: data.styling?.iconColor || data.iconColor || "#a35c38", color: "#ffffff" }}
                                                >
                                                    {service.ctaLabel} <ArrowRight className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <div
                                                    className="mt-auto flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-[15px] w-full opacity-60 cursor-not-allowed"
                                                    style={{ backgroundColor: data.styling?.iconColor || data.iconColor || "#a35c38", color: "#ffffff" }}
                                                >
                                                    {service.ctaLabel} <ArrowRight className="w-4 h-4" />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {data.cta && (
                    <div className="mt-4">
                        <a href={data.cta.href || "#"} className={cn("group relative rounded-2xl py-4 px-8 flex items-center justify-center gap-2.5 w-fit overflow-hidden transition-all duration-300 shadow-sm hover:opacity-90", data.cta.className)} style={{ backgroundColor: data.cta.bg, color: data.cta.text }}>
                            <span className="font-semibold text-[16px] whitespace-nowrap">{data.cta.label}</span>
                            <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}