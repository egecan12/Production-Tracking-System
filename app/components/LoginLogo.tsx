"use client";

import Image from "next/image";

export default function LoginLogo() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-[300px] h-[100px] flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 512 512" 
          className="w-full h-full"
          fill="none"
        >
          {/* Background */}
          <rect width="512" height="512" rx="128" fill="#111827"/>
          
          {/* Main circle */}
          <circle cx="256" cy="256" r="160" fill="none" stroke="#1E293B" stroke-width="24"/>
          
          {/* Progress circle */}
          <path 
            d="M256 96A160 160 0 0 1 416 256"
            stroke="#6366F1" 
            stroke-width="24" 
            stroke-linecap="round"
          />
          
          {/* Bar chart */}
          <rect x="180" y="288" width="32" height="80" rx="12" fill="#F59E0B"/>
          <rect x="240" y="256" width="32" height="112" rx="12" fill="#F59E0B"/>
          <rect x="300" y="224" width="32" height="144" rx="12" fill="#EF4444"/>
          
          {/* Analytics line */}
          <path
            d="M170 208C190 198 210 170 230 184C250 198 270 136 290 152C310 168 330 184 350 174"
            stroke="#10B981"
            stroke-width="12"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
          
          {/* Small gear */}
          <circle cx="186" cy="168" r="24" fill="none" stroke="#9CA3AF" stroke-width="8"/>
          <path
            d="M186 144v-12M186 204v-12M210 168h12M150 168h12M202 152l8-8M162 184l-8 8M202 184l8 8M162 152l-8-8"
            stroke="#9CA3AF"
            stroke-width="6"
            stroke-linecap="round"
          />
          
          {/* Text */}
          <text
            x="256"
            y="420"
            fontSize="60"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            ProdTrack
          </text>
        </svg>
      </div>
    </div>
  );
}
