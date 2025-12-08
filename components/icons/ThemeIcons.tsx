
import React from 'react';

const iconProps = {
  className: "w-8 h-8",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const LifeIcon: React.FC = () => (
    <svg {...iconProps}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

export const BusinessIcon: React.FC = () => (
    <svg {...iconProps}>
        <line x1="6" y1="21" x2="6" y2="3"></line>
        <line x1="18" y1="21" x2="18" y2="3"></line>
        <line x1="2" y1="21" x2="22" y2="21"></line>
        <line x1="2" y1="8" x2="22" y2="8"></line>
        <line x1="10" y1="3" x2="14" y2="3"></line>
    </svg>
);

export const TravelIcon: React.FC = () => (
    <svg {...iconProps}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        <path d="M14.05 2a9 9 0 0 1 8 7.94"></path>
        <path d="M14.05 6A5 5 0 0 1 18 10"></path>
    </svg>
);

export const CultureIcon: React.FC = () => (
    <svg {...iconProps}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

export const AcademicIcon: React.FC = () => (
    <svg {...iconProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);
