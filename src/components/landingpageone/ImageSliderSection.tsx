import React from 'react';
import { cn } from '@/lib/utils';

export default function ImageSliderSection({ data }: { data: any }) {
    if (!data || !data.items || data.items.length === 0) return null;

    // We duplicate the items array so the infinite scroll loops seamlessly without snapping
    const scrollingItems = [...data.items, ...data.items];

    return (
        <section
            id='slider'
            className={cn("py-20 w-full overflow-hidden", data.section?.className)}
            style={{ backgroundColor: data.section?.bg || data.bg || '#ffffff' }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">

                <div className="flex flex-col items-center text-center max-w-[628px] mb-12">
                    <h2
                        className={cn("font-medium text-4xl md:text-[48px] leading-[1.2] tracking-[-1.5px] mb-4", data.heading?.className)}
                        style={{ color: data.heading?.color || data.headingColor }}
                    >
                        {data.heading?.text || data.heading}
                    </h2>
                    <p
                        className={cn("text-base md:text-[18px] leading-[1.6]", data.description?.className)}
                        style={{ color: data.description?.color || data.descColor }}
                    >
                        {data.description?.text || data.description}
                    </p>
                </div>

            </div>

            {/* 🔥 INFINITE SCROLL WRAPPER */}
            {/* INFINITE SCROLL */}
            <div
                className="w-full overflow-hidden
    [mask-image:linear-gradient(to_right,transparent_0%,black_128px,black_calc(100%-128px),transparent_100%)]"
            >
                <ul className="flex w-max flex-nowrap items-center gap-4 animate-infinite-scroll hover:[animation-play-state:paused]">
                    {scrollingItems.map((item: any, index: number) => (
                        <li
                            key={index}
                            className={cn(
                                "relative w-[250px] md:w-[320px] aspect-square shrink-0 overflow-hidden rounded-2xl border border-gray-100 shadow-sm",
                                item.className
                            )}
                        >
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.alt || "Gallery Image"}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}