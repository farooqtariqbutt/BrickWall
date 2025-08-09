import React from 'react';

interface OnScreenControlsProps {
  onLeftPress: () => void;
  onRightPress: () => void;
  onRelease: () => void;
  onFire: () => void;
}

const ControlButton: React.FC<{
    children: React.ReactNode;
    onPress: () => void;
    onRelease?: () => void;
    className?: string;
    ariaLabel: string;
}> = ({ children, onPress, onRelease, className = '', ariaLabel }) => {
    const handlePress = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        onPress();
    };

    const handleRelease = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (onRelease) {
            onRelease();
        }
    };
    
    // For buttons that only fire once on click/tap
    if (!onRelease) {
        return (
             <button
                className={`w-20 h-20 rounded-full flex items-center justify-center bg-slate-200/20 backdrop-blur-sm text-cyan-300 active:bg-slate-200/40 active:text-cyan-200 transition-colors duration-150 select-none ${className}`}
                onClick={handlePress}
                aria-label={ariaLabel}
            >
                {children}
            </button>
        )
    }
    
    // For buttons that are held down
    return (
        <button
            className={`w-24 h-24 rounded-full flex items-center justify-center bg-slate-200/20 backdrop-blur-sm text-white active:bg-slate-200/40 transition-colors duration-150 select-none ${className}`}
            onTouchStart={handlePress}
            onMouseDown={handlePress}
            onTouchEnd={handleRelease}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
};


const OnScreenControls: React.FC<OnScreenControlsProps> = ({ onLeftPress, onRightPress, onRelease, onFire }) => {
  return (
    <div className="w-full h-full flex justify-between items-center" aria-hidden="true">
      <ControlButton onPress={onLeftPress} onRelease={onRelease} ariaLabel="Move Left">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </ControlButton>
      
      <ControlButton onPress={onFire} ariaLabel="Fire" className="w-24 h-24 text-red-400 active:text-red-300">
         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
            <path d="M12 2v2"></path><path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path><path d="M20 12h2"></path>
            <path d="m4.93 19.07 1.41-1.41"></path>
            <path d="m17.66 6.34 1.41-1.41"></path>
         </svg>
      </ControlButton>

      <ControlButton onPress={onRightPress} onRelease={onRelease} ariaLabel="Move Right">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </ControlButton>
    </div>
  );
};

export default OnScreenControls;
