import React from "react";
import AntiMetalButton from "./mainbutton";
import { NAVBAR_CONTENT } from "./data";



export default function Navbar() {
  return (
    <div className="relative w-full flex justify-between items-center mx-4">
      {/* Logo & Brand */}
      <a
        className="flex items-center gap-3 mb-4 md:mb-0 w-1/3 cursor-pointer"
        href={NAVBAR_CONTENT.brand.href}
      >
        <img
          src={NAVBAR_CONTENT.logo.src}
          alt={NAVBAR_CONTENT.logo.alt}
          width={100}
          height={100}
          className="size-10"
        />
        <span className="text-xl font-semibold font-mono tracking-tight text-[#2462EA]">
          {NAVBAR_CONTENT.brand.prefix}
          <span className="text-[#76a2ff]">{NAVBAR_CONTENT.brand.suffix}</span>
        </span>
      </a>

      {/* Desktop Navigation */}
      <div className="md:flex hidden justify-between w-2/3">
        <div className="flex justify-center w-1/2 gap-2 md:gap-9 text-lg mb-4 md:mb-0">
          {NAVBAR_CONTENT.navLinks.map((link, index) => (
            <a
              key={index}
              className={`text-base font-medium hover:text-brand ${
                link.active ? "text-brand" : ""
              }`}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="w-1/2 flex justify-end">
          <AntiMetalButton />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden -mt-4 mr-6">
        <button tabIndex={0}>
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: "none" }}
          >
            <line x1={4} x2={20} y1={12} y2={12} />
            <line x1={4} x2={20} y1={6} y2={6} />
            <line x1={4} x2={20} y1={18} y2={18} />
          </svg>
        </button>
      </div>
    </div>
  );
}