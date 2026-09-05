import React from 'react';
import { Calendar, Mail, Star } from 'lucide-react';
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
            
            {/* 🔥 Guaranteed White Shadow Overlay using mask-image inline styles */}
            <div 
                className="absolute inset-0 z-[5] bg-white/80 md:hidden pointer-events-none" 
                style={{
                    WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 70%)',
                    maskImage: 'linear-gradient(to top, black 20%, transparent 70%)'
                }}
            />

            <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-0 lg:ml-[10%]">
                <div className="flex flex-col max-w-[620px] py-20 md:py-0 pb-12">
                    <div className="flex flex-col gap-6 md:gap-8">
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
                            className={cn(
                                "text-sm md:text-[18px] leading-[1.6] max-w-[380px] font-medium",
                                data.description?.className
                            )}
                            style={{ color: data.description?.color }}
                            dangerouslySetInnerHTML={{ __html: data.description?.text || "" }}
                        />
                    </div>

                    {/* 🔥 DUAL CALL TO ACTION BUTTONS */}
                    <div className={cn("mt-10 md:mt-12 flex gap-2 md:gap-4", data.cta?.className)}>
                        {/* Primary Button (Square) */}
                        <a
                            href={data.cta?.href || "#"}
                            className={cn(
                                "group relative text-sm sm:text-base rounded-2xl py-3.5 px-6 flex items-center justify-center gap-[14px] w-full sm:w-fit overflow-hidden",
                                "transition-all duration-300 shadow-md hover:opacity-90 hover:shadow-lg"
                            )}
                            style={{
                                backgroundColor: data.cta?.bg || '#a35c38',
                                color: data.cta?.text || '#ffffff'
                            }}
                        >
                            <Calendar className="sm:w-5 sm:h-5 w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-[16px] whitespace-nowrap">
                                {data.cta?.label || "Book Online"}
                            </span>
                        </a>

                        {/* Secondary Button (Contact Form) */}
                        {data.ctaSecondary && (
                            <a
                                href={data.ctaSecondary?.href || "#contact"}
                                className={cn(
                                    "group relative text-sm sm:text-base rounded-2xl py-3.5 px-6 flex items-center justify-center gap-[14px] w-full sm:w-fit overflow-hidden",
                                    "transition-all duration-300 shadow-md hover:opacity-90 hover:shadow-lg",
                                    data.ctaSecondary?.className
                                )}
                                style={{
                                    backgroundColor: data.ctaSecondary?.bg || '#1e0c05',
                                    color: data.ctaSecondary?.text || '#ffffff'
                                }}
                            >
                                <Mail className="sm:w-5 sm:h-5 w-4 h-4 flex-shrink-0" />
                                <span className="font-medium text-[16px] whitespace-nowrap">
                                    {data.ctaSecondary?.label || "Request via Form"}
                                </span>
                            </a>
                        )}
                    </div>

                    <div className={cn("flex flex-col gap-2 mt-6 md:mt-10", data.socialProof?.className)}>
                        <div className="flex items-center gap-1 drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity">
                            <a href={data.socialProof?.href || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
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
                            </a>
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