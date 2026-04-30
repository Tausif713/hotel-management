

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Hexagon Background */}
        <path 
          d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
          fill="#FFB800" 
        />
        {/* Stylized 'H' */}
        <path 
          d="M35 25L50 35V75L35 65V25Z" 
          fill="#FF5C00" 
        />
        <path 
          d="M65 25L50 35V75L65 65V25Z" 
          fill="#FF5C00" 
        />
        <path 
          d="M40 45H60V55H40V45Z" 
          fill="#FF5C00" 
        />
      </svg>
    </div>
  );
};
