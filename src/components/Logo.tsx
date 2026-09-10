import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  textColor = 'text-[#3E6B63]',
}) => {
  // SVG Teardrop petal path
  // Tip is at (50, 15)
  // Rounded bottom is centered at (50, 62) with radius 18
  const petalPath = "M50,15 C58,35 68,50 68,62 C68,72 60,80 50,80 C40,80 32,72 32,62 C32,50 42,35 50,15 Z";

  // Rotated around the center of the rounded bottom (50, 62) 
  // to fan the tips out to the top-right while keeping the bottom circular profile aligned
  const rotationAngles = [-35, -17, 1, 19, 37];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-500 hover:rotate-6"
      >
        {/* Render 5 fanned-out overlapping rotated petals */}
        {rotationAngles.map((angle, idx) => (
          <path
            key={idx}
            d={petalPath}
            stroke="#8FCBB0"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            transform={`rotate(${angle}, 50, 62)`}
          />
        ))}
      </svg>
      {showText && (
        <span className={`font-poppins font-bold tracking-wider text-xl ${textColor}`}>
          SAATHI
        </span>
      )}
    </div>
  );
};
export default Logo;
