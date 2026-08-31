import React from 'react';
import { Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import SmartHeading from '../ui/SmartHeading';

export default function HeroSection({ data }: { data: any }) {
    if (!data) return null;

    const rawStars = data.socialProof?.stars;
    const parsedStars = Number(rawStars);
    const starCount = Number.isFinite(parsedStars) ? Math.max(0, Math.floor(parsedStars)) : 5;

    return (
        <section
            id='home'
            // 🔥 The section itself gets a custom class
            className={cn(
                "relative w-full lg:min-h-[115vh] h-screen flex md:items-center items-end overflow-hidden",
                data.section?.className
            )}
            style={{ backgroundColor: data.section?.bg }}
        >
            {data.image?.src && (
                <img
                    src={data.image.src}
                    alt="Hero Background"
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-center z-0",
                        data.image?.className
                    )}
                />
            )}

            <div className="absolute inset-0 z-[5] bg-gradient-to-t from-white/90 via-white/60 to-transparent md:hidden pointer-events-none" />

            <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-0 lg:ml-[10%]">
                <div className="flex flex-col max-w-[620px] mb-14 md:mb-0 py-20">

                    <div className="flex flex-col gap-6 md:gap-8">

                        {/* 🔥 NEW ANNOUNCEMENT BADGE */}
                        {data.announcement && (
                            <div
                                className={cn(
                                    "inline-flex w-fit items-center px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase shadow-sm",
                                    data.announcement?.className
                                )}
                                style={{
                                    backgroundColor: data.announcement?.bg || '#F28222',
                                    color: data.announcement?.textColor || '#ffffff'
                                }}
                            >
                                {data.announcement?.text}
                            </div>
                        )}

                        <SmartHeading
                            as="h1"
                            text={data.heading?.text || data.heading}
                            className={cn(
                                "text-4xl font-semibold md:font-normal md:text-7xl leading-[1.1] tracking-[-2px] lg:tracking-[-5px]",
                                data.heading?.className
                            )}
                            style={{ color: data.heading?.color || data.headingColor }}
                        />
                        <p
                            // 🔥 Description classes injected here
                            className={cn(
                                "text-sm md:text-[18px] leading-[1.6] max-w-[380px] font-medium",
                                data.description?.className
                            )}
                            style={{ color: data.description?.color }}
                            dangerouslySetInnerHTML={{ __html: data.description?.text || "" }}
                        />
                    </div>

                    <div className={cn("mt-10 md:mt-12", data.cta?.className)}>
                        <a
                            href={data.cta?.href || "#"}
                            className={cn(
                                "group relative rounded-2xl py-3.5 px-6 flex items-center justify-center gap-[14px] w-fit overflow-hidden",
                                "transition-all duration-300 shadow-md hover:opacity-90 hover:shadow-lg"
                            )}
                            style={{
                                backgroundColor: data.cta?.bg || '#a35c38',
                                color: data.cta?.text || '#ffffff'
                            }}
                        >
                            <Calendar className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium text-[16px] whitespace-nowrap">
                                {data.cta?.label}
                            </span>
                        </a>
                    </div>

                    <div className={cn("flex flex-col gap-2 mt-6 md:mt-10", data.socialProof?.className)}>
                        <div className="flex items-center gap-1 drop-shadow-md">
                            {[...Array(starCount)].map((_, index) => (
                                <Star
                                    key={index}
                                    className="w-[18px] h-[18px]"
                                    style={{
                                        color: data.socialProof?.starColor || '#8c863a',
                                        fill: data.socialProof?.starColor || '#8c863a'
                                    }}
                                />
                            ))}
                        </div>
                        <p
                            className="font-semibold text-[16px] opacity-100"
                            style={{ color: data.socialProof?.textColor }}
                        >
                            {data.socialProof?.text}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}