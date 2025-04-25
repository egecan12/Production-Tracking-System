import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-[300px] h-[100px] flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 512 512" 
          className="w-full h-full"
          fill="none"
        >
          <g>
            {/* Factory Building */}
            <path 
              d="M32 352v96a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-96" 
              stroke="#4B5563" 
              strokeWidth="24" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M112 464v-112h96v112" 
              stroke="#4B5563" 
              strokeWidth="20" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M304 464v-112h96v112" 
              stroke="#4B5563" 
              strokeWidth="20" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* Roof */}
            <path 
              d="M24 352l80-128h304l80 128" 
              stroke="#4B5563" 
              strokeWidth="24" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* Gear icon */}
            <circle 
              cx="256" 
              cy="224" 
              r="56" 
              stroke="#6366F1" 
              strokeWidth="16" 
              fill="none"
            />
            
            {/* Gear teeth */}
            <path
              d="M256 168v-32M256 312v-32M312 224h32M168 224h32M293 187l22-22M197 261l-22 22M293 261l22 22M197 187l-22-22"
              stroke="#6366F1"
              strokeWidth="14"
              strokeLinecap="round"
            />
            
            {/* Chart lines */}
            <path
              d="M172 96h168"
              stroke="#EF4444"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M200 128h112"
              stroke="#F59E0B"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M240 160h32"
              stroke="#10B981"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </g>
          
          {/* Text */}
          <text
            x="256"
            y="420"
            fontSize="36"
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
