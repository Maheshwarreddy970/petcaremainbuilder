import React from 'react';
import { ArrowRight, Sparkles, HeartPulse, Activity, ShieldCheck, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// 🔥 Uses clean, professional Lucide icons instead of the confusing towel graphic
const iconMappings = [
    { keywords: ['clean', 'teeth', 'plaque', 'tartar', 'bath', 'wash', 'groom'], component: Sparkles },
    { keywords: ['health', 'vet', 'care', 'check', 'puppy'], component: Activity },
    { keywords: ['fresh', 'breath', 'rinse', 'mouth'], component: HeartPulse },
    { keywords: ['protect', 'safe', 'nail', 'trim'], component: ShieldCheck }
];
const fallbackIcons = [Sparkles, Heart, Activity, ShieldCheck];

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
        <section id='services' className={cn("py-20 w-full overflow-hidden", data.section?.className)} style={{ backgroundColor: data.section?.bg || data.bg }}>
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                <div className="flex flex-col items-center text-center max-w-[560px] mb-12 lg:mb-[72px]">
                    <h2 className={cn("font-medium text-4xl md:text-[48px] leading-[1.2] tracking-[-1.5px] mb-4", data.heading?.className)} style={{ color: data.heading?.color || data.headingColor }} dangerouslySetInnerHTML={{ __html: data.heading?.text || data.heading || "" }} />
                    <p className={cn("text-base md:text-[18px] leading-[1.6]", data.description?.className)} style={{ color: data.description?.color || data.descColor }} dangerouslySetInnerHTML={{ __html: data.description?.text || data.description || "" }} />
                </div>

                <div className={cn("grid gap-6 w-full mb-12", getGridClasses(services.length))}>
                    {services.map((service: any, index: number) => {
                        const Icon = getIconForService(service);
                        
                        // Check if a valid URL exists
                        const hasValidLink = service.href && service.href.trim() !== "" && service.href.trim() !== "#";

                        return (
                            <div key={index} className={cn("h-full", service.className)}>
                                <div className={cn("group flex flex-col h-full border rounded-2xl p-7 transition-all duration-300 hover:shadow-md hover:-translate-y-1", data.styling?.className)} style={{ backgroundColor: data.styling?.cardBg || data.cardBg, borderColor: data.styling?.cardBorder || data.cardBorder }}>
                                    <div className="mb-[37px]">
                                        <Icon className="w-11 h-11 stroke-[1.5]" style={{ color: data.styling?.iconColor || data.iconColor }} />
                                    </div>
                                    <div className="flex flex-col flex-grow justify-between gap-[30px]">
                                        <div>
                                            <h3 className="font-medium text-[20px] leading-[1.2] tracking-[-0.5px] mb-[10px]" style={{ color: data.styling?.titleColor || data.titleColor }}>{service.title}</h3>
                                            <p className="text-[14px] leading-[1.48]" style={{ color: data.description?.color || data.descColor }}>{service.description}</p>
                                        </div>
                                        {service.priceLabel && <div className="font-semibold text-sm mb-2" style={{ color: data.styling?.priceColor || data.priceColor }}>{service.priceLabel}</div>}
                                        
                                        {/* 🔥 SMART BUTTON LOGIC */}
                                        {service.ctaLabel && (
                                            hasValidLink ? (
                                                <a
                                                    href={service.href}
                                                    className="mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-[15px] transition-all duration-300 hover:shadow-md hover:opacity-90"
                                                    style={{ backgroundColor: data.styling?.iconColor || data.iconColor || "#a35c38", color: "#ffffff" }}
                                                >
                                                    {service.ctaLabel} <ArrowRight className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <div 
                                                    className="mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-[15px] opacity-70 cursor-not-allowed"
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
                    <div>
                        <a href={data.cta.href || "#"} className={cn("group relative rounded-2xl py-3.5 px-6 flex items-center justify-center gap-2.5 w-fit overflow-hidden transition-all duration-300 shadow-sm hover:opacity-90", data.cta.className)} style={{ backgroundColor: data.cta.bg, color: data.cta.text }}>
                            <span className="font-medium text-[16px] whitespace-nowrap">{data.cta.label}</span>
                            <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}