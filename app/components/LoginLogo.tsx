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
          <circle cx="256" cy="206" r="120" fill="none" stroke="#6366F1" stroke-width="20" opacity="0.2"/>
          
          {/* Progress circle */}
          <path 
            d="M256 86A120 120 0 0 1 376 206"
            stroke="#6366F1" 
            stroke-width="20" 
            stroke-linecap="round"
          />
          
          {/* Bar chart */}
          <rect x="190" y="226" width="24" height="60" rx="4" fill="#F59E0B"/>
          <rect x="244" y="196" width="24" height="90" rx="4" fill="#6366F1"/>
          <rect x="298" y="176" width="24" height="110" rx="4" fill="#EF4444"/>
          
          {/* Analytics line */}
          <path
            d="M180 158C196 148 212 130 228 144C244 158 260 116 276 128C292 140 308 156 324 146"
            stroke="#10B981"
            stroke-width="10"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
          
          {/* Small gear */}
          <circle cx="186" cy="128" r="20" fill="none" stroke="#9CA3AF" stroke-width="6"/>
          <path
            d="M186 108v-10M186 158v-10M206 128h10M156 128h10M198 116l7-7M167 140l-7 7M198 140l7 7M167 116l-7-7"
            stroke="#9CA3AF"
            stroke-width="5"
            stroke-linecap="round"
          />
          
          {/* Text */}
          <text
            x="256"
            y="340"
            fontSize="40"
            fontWeight="bold"
            fill="#E5E7EB"
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
