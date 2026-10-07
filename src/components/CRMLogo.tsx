import React from 'react';
import crmLogoImg from '../assets/images/crm_logo_v2_1784807669094.jpg';

interface CRMLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  darkTheme?: boolean;
  showBorder?: boolean;
}

export const CRMLogo: React.FC<CRMLogoProps> = ({
  size = 'md',
  className = '',
  darkTheme = false,
  showBorder = true,
}) => {
  let sizeClasses = 'w-10 h-10';
  if (typeof size === 'string') {
    switch (size) {
      case 'xs':
        sizeClasses = 'w-7 h-7';
        break;
      case 'sm':
        sizeClasses = 'w-9 h-9';
        break;
      case 'md':
        sizeClasses = 'w-12 h-12';
        break;
      case 'lg':
        sizeClasses = 'w-20 h-20';
        break;
      case 'xl':
        sizeClasses = 'w-48 h-48 sm:w-56 sm:h-56';
        break;
    }
  }

  const customStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-[1.02] ${
        showBorder 
          ? darkTheme 
            ? 'p-1 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-xl' 
            : 'p-1 rounded-2xl bg-white border border-slate-200/80 shadow-md' 
          : ''
      } ${className}`}
      style={customStyle}
    >
      <img
        src={crmLogoImg}
        alt="Customer Relationship Management Logo"
        className={`${sizeClasses} object-contain rounded-xl`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export const CRMBadgeLogo: React.FC<{ darkTheme?: boolean; className?: string }> = ({ 
  darkTheme = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center select-none animate-fadeIn ${className}`}>
      <div className={`p-3 sm:p-4 rounded-3xl ${
        darkTheme 
          ? 'bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.15)]' 
          : 'bg-white border border-slate-200/90 shadow-xl'
      }`}>
        <img
          src={crmLogoImg}
          alt="CRM - Customer Relationship Management Logo"
          className="w-48 h-48 sm:w-60 sm:h-60 object-contain rounded-2xl transition-transform duration-300 hover:scale-[1.01]"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default CRMLogo;
