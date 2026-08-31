"use client";

import React, { ReactNode } from "react";

interface AuthWaveLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export default function AuthWaveLayout({ left, right }: AuthWaveLayoutProps) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-0 lg:p-6"
      style={{ background: "var(--bg)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute rounded-full animate-blob-1"
          style={{
            width: "60vw",
            height: "60vw",
            bottom: "-20vw",
            left: "-15vw",
            background: "var(--amber-light)",
            opacity: 0.15,
          }}
        />
        <div
          className="absolute rounded-full animate-blob-2"
          style={{
            width: "50vw",
            height: "50vw",
            top: "-10vw",
            right: "-10vw",
            background: "var(--green-deep)",
            opacity: 0.1,
          }}
        />
      </div>

      {/* Main Container */}
      <div
        className="relative z-10 w-full min-h-screen lg:min-h-[600px] lg:h-auto lg:w-[min(1000px,94vw)] 
                   flex flex-col lg:flex-row lg:rounded-[32px] overflow-hidden 
                   lg:shadow-[0_24px_80px_rgba(30,77,43,0.15)] bg-[var(--green-deep)]"
      >
        {/* Left Panel (Desktop lg:1024px+) */}
        <div
          className="hidden lg:flex flex-col items-center justify-center px-12 py-10 w-[42%] shrink-0"
          style={{ background: "var(--cream)" }}
        >
          <div className="w-full max-w-[320px]">
            {left}
          </div>
        </div>

        {/* Wave Divider (Desktop) */}
        <div
          className="hidden lg:block absolute z-20 top-0 bottom-0 pointer-events-none"
          style={{ left: "calc(42% - 60px)", width: 121 }}
        >
          <svg
            viewBox="0 0 120 800"
            preserveAspectRatio="none"
            className="w-full h-full block"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wave soft shadow */}
            <path
              d="M75,0 C75,0 30,160 38,300 C46,440 95,510 90,640 C85,730 75,800 75,800 L120,800 L120,0 Z"
              fill="rgba(0,0,0,0.08)"
            />
            {/* Wave primary layer */}
            <path
              d="M50,0 C50,0 6,160 14,300 C22,440 70,510 65,640 C60,730 50,800 50,800 L120,800 L120,0 Z"
              fill="var(--green-deep)"
            />
            {/* Wave left panel base */}
            <path
              d="M50,0 C50,0 6,160 14,300 C22,440 70,510 65,640 C60,730 50,800 50,800 L0,800 L0,0 Z"
              fill="var(--cream)"
            />
          </svg>
        </div>

        {/* Right Panel (Full on mobile, right column on desktop) */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 lg:py-10 
                     min-h-screen lg:min-h-0 overflow-y-auto relative"
        >
          {/* Mobile ambient glow */}
          <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--sage-light)] opacity-5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[var(--amber-light)] opacity-5 blur-3xl" />
          </div>

          <div className="w-full max-w-[400px] relative z-10">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
