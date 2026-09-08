import { ShieldCheck } from "lucide-react";
import { COMPARISON_DATA, SECTION_CONTENT_COMPARISON, TABLE_HEADERS } from "./data";


// --- COMPONENT ---
export function UsVsThemComparison() {
    return (
        <section className="bg-white px-4">
            {/* Header Section */}
            <div className="mb-16 mt-8 flex flex-col items-center justify-center space-y-3 text-center tracking-tight md:mt-16 md:mb-24">
                <div className="w-fit gap-2 rounded-3xl border-[1.3px] border-[#D6D6D6] px-4 py-1 text-sm font-medium shadow-[0px_1px_2px_0px_#0000001A,0px_4px_4px_0px_#00000017,0px_9px_5px_0px_#0000000D,0px_16px_6px_0px_#00000003,0px_25px_7px_0px_#00000000] md:text-base">
                    {SECTION_CONTENT_COMPARISON.badge}
                </div>
                <h2 className="mb-2 max-w-3xl text-center text-3xl font-semibold text-black md:text-4xl lg:text-5xl">
                    {SECTION_CONTENT_COMPARISON .title}
                </h2>
                <p className="w-72 px-1 text-center text-sm text-[#737373] md:w-[670px] md:text-base lg:text-lg">
                    {SECTION_CONTENT_COMPARISON.subtitle}
                </p>
            </div>

            {/* Comparison Container */}
            <div className="relative mx-auto overflow-hidden rounded-[35px] border border-[#E6E6E6]">
                {/* Dot-grid backdrop */}
                <div
                    className="absolute top-0 left-0 h-full w-full"
                    style={{
                        backgroundImage: "radial-gradient(circle, #EBEBEB 1px, transparent 1px)",
                        backgroundSize: "10px 10px",
                    }}
                />

                {/* Rotated icon chip */}
                <div className="absolute -top-6 -right-6 -z-10 hidden rotate-[14deg] md:block">
                    <div
                        style={{
                            background: "linear-gradient(147.09deg, #fbfbfb 9.63%, #e8e8e8 91.74%)",
                        }}
                        className="size-16 flex items-center justify-center rounded-2xl border border-[#f3f3f3] shadow-[0px_5px_11px_0px_rgba(0,0,0,0.1),0px_20px_20px_0px_rgba(0,0,0,0.09),0px_44px_27px_0px_rgba(0,0,0,0.05)] lg:size-20"
                    >
                        <ShieldCheck className="size-8 text-[#2462EA] lg:size-10" />
                    </div>
                </div>

                <div className="overflow-x-auto p-6 md:p-10 lg:p-14">
                    <div className="relative min-w-[800px]">
                        {/* Elevated highlight lane behind the "us" column */}
                        <div
                            className="pointer-events-none absolute top-0 bottom-0 rounded-3xl"
                            style={{
                                left: "25%",
                                width: "25%",
                                background: "#2462EA",
                            }}
                        />

                        {/* Header Row */}
                        <div className="relative grid grid-cols-4 gap-4 pb-6">
                            <div className="flex items-end p-2 text-lg font-semibold text-black">
                                {TABLE_HEADERS.feature}
                            </div>

                            <div className="flex flex-col items-center justify-center gap-1 p-4 text-center">
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                                    {TABLE_HEADERS.recommendedBadge}
                                </span>
                                <span className="mt-2 text-xl font-bold text-white">
                                    {TABLE_HEADERS.brandName}
                                </span>
                            </div>

                            <div className="flex items-center justify-center p-4 text-center">
                                <span className="text-lg font-semibold text-[#A3A3A3]">
                                    {TABLE_HEADERS.wixSquarespace}
                                </span>
                            </div>

                            <div className="flex items-center justify-center p-4 text-center">
                                <span className="text-lg font-semibold text-[#A3A3A3]">
                                    {TABLE_HEADERS.wordpress}
                                </span>
                            </div>
                        </div>

                        {/* Feature Rows */}
                        <div className="relative">
                            {COMPARISON_DATA.map((row, index) => (
                                <div key={index} className="grid grid-cols-4 items-stretch gap-4 py-4">
                                    <div className="flex items-center p-2 text-sm font-medium text-black md:text-base">
                                        {row.feature}
                                    </div>

                                    <div className="flex items-center justify-center p-4 text-center text-sm font-semibold text-white md:text-base">
                                        {row.us}
                                    </div>

                                    <div className="flex items-center justify-center p-4 text-center text-sm font-medium text-[#737373] md:text-base">
                                        {row.wix}
                                    </div>

                                    <div className="flex items-center justify-center p-4 text-center text-sm font-medium text-[#737373] md:text-base">
                                        {row.wp}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom cap so the blue lane reads as one continuous card */}
                        <div
                            className="pointer-events-none absolute bottom-0 rounded-b-3xl"
                            style={{ left: "25%", width: "25%", height: "1px" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}