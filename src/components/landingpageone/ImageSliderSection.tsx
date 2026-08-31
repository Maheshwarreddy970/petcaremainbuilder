import React from 'react';
import { cn } from '@/lib/utils';
import SmartHeading from '../ui/SmartHeading';

export default function ImageSliderSection({ data }: { data: any }) {
    if (!data || !data.items || data.items.length === 0) return null;

    const scrollingItems = [...data.items, ...data.items];

    return (
        <section 
            id='slider' 
            className={cn("py-20 w-full overflow-hidden", data.section?.className)} 
            style={{ backgroundColor: data.section?.bg || data.bg || '#ffffff' }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">
                <div className="flex flex-col items-center text-center max-w-[628px] mb-12">
                   <SmartHeading 
    as="h2"
    text={data.heading?.text || data.heading}
    className={cn("font-medium text-4xl md:text-[48px] leading-[1.2] tracking-[-1.5px] mb-4", data.heading?.className)} 
    style={{ color: data.heading?.color || data.headingColor }}
/>
                    <p 
                        className={cn("text-base md:text-[18px] leading-[1.6]", data.description?.className)} 
                        style={{ color: data.description?.color || data.descColor }}
                    >
                        {data.description?.text || data.description}
                    </p>
                </div>
            </div>

            {/* 🔥 FIX: Flattened this className onto a single line to prevent Hydration \r\n mismatches! */}
            <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                <ul className="flex items-center justify-center md:justify-start gap-4 animate-infinite-scroll hover:[animation-play-state:paused]">
                    {scrollingItems.map((item: any, index: number) => (
                        <li key={index} className={cn("relative w-[250px] md:w-[320px] aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100", item.className)}>
                            {item.image && (
                                <img 
                                    src={item.image} 
                                    alt={item.alt || "Gallery Image"} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}