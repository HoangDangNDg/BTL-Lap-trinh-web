import React, { useId, memo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type LogoVariant = 'icon-only' | 'compact' | 'full' | 'vertical';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoTheme = 'dark' | 'light';
export type LogoLStyle = 'haute-couture' | 'calligraphy';

export interface LogoEduCenterProps {
  variant?: LogoVariant;
  size?: LogoSize | number;
  theme?: LogoTheme;
  lStyle?: LogoLStyle;
  className?: string;
  style?: React.CSSProperties;
  showGlow?: boolean;
  interactive?: boolean;
  asLink?: boolean;
  to?: string;
  title?: string;
}

const sizeConfig: Record<LogoSize, { iconSize: number; titleSize: string; subtitleSize: string; gap: string }> = {
  sm: { iconSize: 32, titleSize: 'text-lg', subtitleSize: 'text-[9px]', gap: 'gap-2.5' },
  md: { iconSize: 42, titleSize: 'text-xl', subtitleSize: 'text-[10px]', gap: 'gap-3' },
  lg: { iconSize: 56, titleSize: 'text-2xl', subtitleSize: 'text-xs', gap: 'gap-3.5' },
  xl: { iconSize: 68, titleSize: 'text-3xl', subtitleSize: 'text-xs', gap: 'gap-4' },
};

/**
 * Biểu Tượng Chữ "L" Nghệ Thuật Trắng Đen (Monochrome Luxury Typography)
 * Hỗ trợ 2 phong cách chữ đẹp:
 * 1. 'haute-couture': Phong cách thời trang cao cấp Didone (Bodoni/Vogue) với nét vát nhọn và ánh sao kim cương.
 * 2. 'calligraphy': Phong cách thư pháp bút lông uốn lượn uyển chuyển (Lucida Calligraphy).
 */
export const LogoEduCenterIcon: React.FC<{
  size: number;
  theme?: LogoTheme;
  lStyle?: LogoLStyle;
  showGlow?: boolean;
  className?: string;
}> = memo(({ size, theme = 'dark', lStyle = 'haute-couture', showGlow = true, className }) => {
  const uniqueId = useId().replace(/:/g, '_');
  const shadowId = `l-shadow-${uniqueId}`;
  const bgGradId = `l-bg-${uniqueId}`;
  const rimGradId = `l-rim-${uniqueId}`;
  const shineGradId = `l-shine-${uniqueId}`;

  const isDark = theme === 'dark';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none transition-transform duration-300', className)}
      aria-label="Monogram L Emblem"
    >
      <defs>
        {/* Soft Ambient Depth Shadow */}
        {showGlow && (
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodColor="#000000"
              floodOpacity={isDark ? 0.35 : 0.15}
            />
          </filter>
        )}

        {/* Base Background Gradient */}
        <linearGradient id={bgGradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#000000" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F4F4F5" />
            </>
          )}
        </linearGradient>

        {/* Metallic Silver Rim */}
        <linearGradient id={rimGradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#09090B" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0.06" />
            </>
          )}
        </linearGradient>

        {/* Top Gloss Shine */}
        <linearGradient id={shineGradId} x1="32" y1="2" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.22 : 0.5} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Squircle Obsidian Badge Container */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill={`url(#${bgGradId})`}
        filter={showGlow ? `url(#${shadowId})` : undefined}
      />

      {/* Inner Metallic Precision Rim */}
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="15.5"
        stroke={`url(#${rimGradId})`}
        strokeWidth="1.2"
      />

      {/* Subtle Top Glass Shine */}
      <path
        d="M4 18C4 10.268 10.268 4 18 4H46C53.732 4 60 10.268 60 18C60 22 48 30 32 30C16 30 4 22 4 18Z"
        fill={`url(#${shineGradId})`}
      />

      {/* ================= Typography Letter "L" ================= */}
      {lStyle === 'haute-couture' ? (
        <g>
          {/* Haute Couture Didone L (Bodoni Italic) */}
          <path
            d="M 31.01 15.08 L 23.14 52.04 L 31.01 52.04 C 33.54 52.04, 35.51 51.81, 36.92 51.34 C 38.33 50.87, 39.64 49.83, 40.85 48.22 C 42.07 46.61, 43.39 44.06, 44.82 40.56 L 46.37 40.56 L 42.82 53.56 L 10.43 53.56 L 10.76 52.04 L 16.31 52.04 L 24.06 15.08 L 18.13 15.08 L 18.45 13.56 L 37.25 13.56 L 36.89 15.08 Z"
            fill={isDark ? '#FFFFFF' : '#09090B'}
          />

          {/* 4-Point Diamond Sparkle Star */}
          <path
            d="M 47 21 L 48.2 18 L 51 16.8 L 48.2 15.6 L 47 13 L 45.8 15.6 L 43 16.8 L 45.8 18 Z"
            fill={isDark ? '#FFFFFF' : '#09090B'}
            fillOpacity={0.95}
          />
        </g>
      ) : (
        <g>
          {/* Flowing Calligraphic Cursive L (Lucida Calligraphy) */}
          <path
            d="M 7.86 50.19 L 11.53 46.37 L 13.03 46.37 C 15.08 46.37, 16.57 45.78, 17.52 44.59 C 18.47 43.4, 19.29 41.1, 19.97 37.69 L 22.61 24.47 C 23.38 20.57, 25.16 17.34, 27.95 14.8 C 30.74 12.26, 33.91 10.99, 37.46 10.99 C 39.04 10.99, 40.87 11.56, 42.96 12.7 L 41.67 19.13 L 40.01 19.13 C 40.06 18.68, 40.09 18.31, 40.09 18.02 C 40.09 14.82, 38.44 13.21, 35.13 13.21 C 31.88 13.21, 29.7 15.99, 28.6 21.56 L 26.22 33.43 C 25.52 37, 24.53 39.73, 23.27 41.65 C 22 43.56, 20.03 45.25, 17.37 46.73 L 31.8 46.97 C 35.95 46.97, 39.6 46, 42.75 44.07 L 42.36 46.01 C 39.95 48.14, 38.14 49.51, 36.93 50.1 C 35.71 50.7, 34.11 50.99, 32.11 50.99 Z"
            fill={isDark ? '#FFFFFF' : '#09090B'}
          />
        </g>
      )}
    </svg>
  );
});

LogoEduCenterIcon.displayName = 'LogoEduCenterIcon';

/**
 * Component Logo Tái Sử Dụng với Chữ "L" Trắng Đen Đẳng Cấp
 */
export const LogoEduCenter: React.FC<LogoEduCenterProps> = memo(({
  variant = 'compact',
  size = 'md',
  theme = 'dark',
  lStyle = 'haute-couture',
  className,
  style,
  showGlow = true,
  interactive = true,
  asLink = false,
  to = '/',
  title = 'EduCenter ERP - Monogram L',
}) => {
  const config = typeof size === 'number'
    ? { iconSize: size, titleSize: 'text-xl', subtitleSize: 'text-[10px]', gap: 'gap-3' }
    : sizeConfig[size] || sizeConfig.md;

  const content = (
    <div
      title={title}
      style={style}
      className={cn(
        'inline-flex items-center select-none font-sans',
        variant === 'vertical' ? 'flex-col text-center gap-2' : config.gap,
        interactive && 'group transition-all duration-300 hover:opacity-95',
        className
      )}
    >
      {/* Icon Vector Badge L */}
      <div
        className={cn(
          'relative flex items-center justify-center',
          interactive && 'transition-transform duration-300 group-hover:scale-105'
        )}
      >
        <LogoEduCenterIcon size={config.iconSize} theme={theme} lStyle={lStyle} showGlow={showGlow} />
      </div>

      {/* Typography & Brand Wordmark */}
      {variant !== 'icon-only' && (
        <div className={cn('flex flex-col leading-none', variant === 'vertical' && 'items-center')}>
          <div className="flex items-center tracking-tight">
            <span className={cn('font-extrabold text-[#09090B]', config.titleSize)}>
              Edu
            </span>
            <span className={cn('font-bold text-[#52525B]', config.titleSize)}>
              Center
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#09090B] ml-0.5 mb-2.5 inline-block shadow-sm" />
          </div>

          {(variant === 'full' || variant === 'vertical') && (
            <span
              className={cn(
                'font-semibold text-[#71717A] tracking-[0.16em] uppercase mt-1',
                config.subtitleSize
              )}
            >
              Hệ thống quản trị đào tạo
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-block no-underline focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
});

LogoEduCenter.displayName = 'LogoEduCenter';

export default LogoEduCenter;
