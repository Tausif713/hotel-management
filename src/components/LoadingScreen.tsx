import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
        {/* Spinning Ring */}
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        
        {/* Pulsing Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full animate-pulse shadow-lg shadow-indigo-200"></div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">GrandHotel</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Syncing with Cloud...</p>
      </div>
      
      {/* Loading Bar */}
      <div className="mt-6 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 w-1/2 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
);
