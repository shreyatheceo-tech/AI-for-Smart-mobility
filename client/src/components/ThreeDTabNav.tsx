import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  pastelAccent?: 'lavender' | 'mint' | 'blush' | 'sage';
}

interface ThreeDTabNavProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const ThreeDTabNav: React.FC<ThreeDTabNavProps> = ({
  tabs,
  activeTabId,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 p-2 rounded-cute-full bg-cream-200/70 border border-warm-border/80 shadow-neumorphic-sm backdrop-blur-md transition-all duration-300 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 sm:px-5 py-2.5 rounded-cute-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 squish-click ${
              isActive
                ? 'clay-tab-pressed bg-cream-300/80 text-warm-charcoal font-extrabold border border-warm-border/90'
                : 'clay-pill-floating bg-warm-white text-warm-muted hover:text-warm-charcoal hover:-translate-y-0.5 border border-white/80'
            }`}
          >
            {tab.icon && (
              <span
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-rose-500' : 'group-hover:scale-105'
                }`}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm transition-transform duration-200 ${
                  isActive
                    ? 'bg-rose-400 text-white scale-105'
                    : 'bg-cream-200 text-warm-muted'
                }`}
              >
                {tab.badge}
              </span>
            )}

            {/* Subtle tactile 3D light reflection highlight on top edge */}
            {!isActive && (
              <span className="absolute top-1 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThreeDTabNav;
