import React from 'react'
import { FOOTER_CONTENT } from './data'


export default function Footer() {
  return (
    <div className="md:h-[683px] h-[200%] p-4 pb-0 relative rounded-[35px] border border-[#E6E6E6] mb-11 overflow-hidden flex flex-col justify-between">
      <div
        className="absolute -z-20 top-0 left-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle, #e6e6e6 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />

      <div className="absolute  -bottom-44 -left-36 md:-bottom-40 md:-left-20 md:z-10 -z-10 rotate-[20deg] md:[&>*]:scale-100 [&>*]:scale-50">
        <div className="relative h-[439px] w-[405px]">
          <img
            src={FOOTER_CONTENT.graphics.left.src}
            alt={FOOTER_CONTENT.graphics.left.alt}
            width={100}
            height={100}
            className="size-96"
          />
        </div>
      </div>

      <div className="absolute  -bottom-48 -right-36 md:-bottom-36 md:-right-10 rotate-[-10deg] md:z-10 -z-10 md:[&>*]:scale-100 [&>*]:scale-50">
        <div className="relative w-[400px] h-[439px]">
          <img
            src={FOOTER_CONTENT.graphics.right.src}
            alt={FOOTER_CONTENT.graphics.right.alt}
            width={100}
            height={100}
            className="size-60"
          />
        </div>
      </div>

      <div className="relative flex xl:flex-row flex-col">
        <div className="w-[740px] md:p-9 p-2">
          <div className="flex items-center gap-3">
            <img
              src={FOOTER_CONTENT.brand.logo.src}
              alt={FOOTER_CONTENT.brand.logo.alt}
              width={100}
              height={100}
              className="size-8"
            />
            <label className="text-3xl font-semibold">
              {FOOTER_CONTENT.brand.name}
            </label>
          </div>
          <p className="md:text-3xl lg:text-5xl font-bold text-lg tracking-tight md:leading-[54px] md:w-[700px] w-[300px] md:mt-9 mt-4">
            {FOOTER_CONTENT.brand.tagline}
          </p>
        </div>
        <div className="flex items-center xl:justify-end justify-start w-full md:px-10 xl:px-0">
          <div className="grid grid-cols-2 md:grid-cols-3 justify-end md:w-1/2 w-[80%] md:gap-10 gap-20 xl:mt-32 mt-5 mr-10 px-2">
            {FOOTER_CONTENT.navigation.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h1 className="font-extrabold">{section.title}</h1>
                {section.links.map((link) => (
                  <a
                    key={link.label}
                    className="font-normal text-[#535353] text-nowrap transition-colors hover:text-[#2462EA]"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className="border-[#CCCCCC] border-dashed border-t w-full h-1 mt:mt-10 mt-32" />
        <div className="h-20 flex justify-center items-center md:gap-10 gap-2 mb-36 md:mb-0">
          <p className="text-[#737373] font-normal md:text-lg text-xs text-nowrap">
            {FOOTER_CONTENT.bottom.copyright}
          </p>
          <div className="flex md:gap-5 gap-3 [&>*]:md:scale-100 scale-75">
            {FOOTER_CONTENT.bottom.socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="opacity-70 transition-opacity hover:opacity-100"
                aria-label={social.name}
              >
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={social.svgPath} fill="#808080" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}