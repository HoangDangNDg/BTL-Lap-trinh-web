"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Global SVG Refraction Filter for iOS Water Droplet & Liquid Glass
 */
export function LiquidGlassFilters() {
  return (
    <svg
      className="pointer-events-none fixed -top-[9999px] -left-[9999px] h-0 w-0 opacity-0"
      aria-hidden="true"
    >
      <defs>
        {/* iOS Water Droplet Optical Refraction Filter */}
        <filter
          id="ios-droplet-refraction"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.035"
            numOctaves="2"
            seed="3"
            result="waterNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="waterNoise"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refractedImage"
          />
          <feGaussianBlur in="waterNoise" stdDeviation="1.2" result="blurredNoise" />
          <feSpecularLighting
            in="blurredNoise"
            surfaceScale="2"
            specularConstant="1.4"
            specularExponent="22"
            lightingColor="#ffffff"
            result="specularLight"
          >
            <fePointLight x="60" y="-60" z="160" />
          </feSpecularLighting>
          <feComposite in="specularLight" in2="SourceAlpha" operator="in" result="specularHighlight" />
          <feBlend in="refractedImage" in2="specularHighlight" mode="screen" />
        </filter>
      </defs>
    </svg>
  )
}

/**
 * LIQUID GLASS TABS / SEGMENTED CONTROL (Tấm kính lỏng khúc xạ trượt theo lựa chọn)
 * Khi người dùng click vào bất kỳ lựa chọn nào, tấm kính liquid glass sẽ lướt mượt mà đến vị trí đó
 */
export interface TabOption<T = string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
}

export interface LiquidGlassTabsProps<T extends string | number = string> {
  options: {
    label: string
    value: T
    icon?: React.ReactNode
  }[]
  value: T
  onChange: (val: T) => void
  className?: string
  size?: "sm" | "default" | "lg"
}

export function LiquidGlassTabs<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = "default",
}: LiquidGlassTabsProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState<{
    left: number
    width: number
    height: number
    top: number
    opacity: number
  }>({ left: 0, width: 0, height: 0, top: 0, opacity: 0 })

  const tabRefs = React.useRef<Map<T, HTMLButtonElement>>(new Map())

  // Cập nhật vị trí tấm thẻ lăn sang cái được chọn - cao đúng bằng 95% thẻ cha
  const updateIndicator = React.useCallback(() => {
    const activeEl = tabRefs.current.get(value)
    const containerEl = containerRef.current

    if (activeEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()

      const parentHeight = containerRect.height
      const indicatorHeight = parentHeight * 0.95 // Cao bằng 95% thẻ cha
      const indicatorTop = (parentHeight - indicatorHeight) / 2 // Căn giữa hoàn hảo (2.5% lề trên & 2.5% lề dưới)

      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        height: indicatorHeight,
        top: indicatorTop,
        opacity: 1,
      })
    }
  }, [value])

  React.useLayoutEffect(() => {
    updateIndicator()
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [updateIndicator])

  const sizeClasses = {
    sm: "p-1 text-xs gap-1.5",
    default: "p-1.5 text-sm gap-2",
    lg: "p-2 text-base gap-3",
  }

  // Tăng chiều cao Padding Top/Bottom cao hơn giúp chữ rộng rãi, thoáng mắt
  const tabPadding = {
    sm: "px-4 py-2 min-w-[90px] text-xs font-semibold whitespace-nowrap",
    default: "px-6 py-2.5 min-w-[120px] text-sm font-bold whitespace-nowrap",
    lg: "px-8 py-3.5 min-w-[150px] text-base font-bold whitespace-nowrap",
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center rounded-full bg-[#EEF2F6] border border-[#E2E8F0] select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]",
        sizeClasses[size],
        className
      )}
    >
      {/* Tấm Thẻ Lăn Sang Cái Được Chọn (Cao Bằng Đúng 95% Thẻ Cha) */}
      <div
        className="pointer-events-none absolute z-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          height: indicatorStyle.height ? `${indicatorStyle.height}px` : '95%',
          top: indicatorStyle.top !== undefined ? `${indicatorStyle.top}px` : '2.5%',
          opacity: indicatorStyle.opacity,
          left: 0,
        }}
      >
        <div
          className="w-full h-full rounded-full bg-white border border-white"
          style={{
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.09), 0 1px 3px rgba(15, 23, 42, 0.04), inset 1.5px 1.5px 3px rgba(255, 255, 255, 1), inset -1px -1px 2px rgba(0, 0, 0, 0.03)'
          }}
        />
      </div>

      {/* Các Nút Lựa Chọn với Padding Top/Bottom Cao Thoáng */}
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={String(opt.value)}
            ref={(el) => {
              if (el) tabRefs.current.set(opt.value, el)
              else tabRefs.current.delete(opt.value)
            }}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer outline-none text-center whitespace-nowrap",
              tabPadding[size],
              isActive
                ? "text-[#0F172A] font-extrabold"
                : "text-[#64748B] font-semibold hover:text-[#0F172A]"
            )}
            style={{
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap'
            }}
          >
            {opt.icon && <span className="shrink-0 flex items-center">{opt.icon}</span>}
            <span style={{ whiteSpace: 'nowrap' }}>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer overflow-hidden select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#0095F6] text-white hover:bg-[#1877F2] shadow-sm hover:shadow active:scale-[0.98]",
        cool:
          "bg-gradient-to-t from-[#0095F6] to-[#38BDF8] text-white border border-[#0095F6]/40 shadow-[0_4px_12px_rgba(0,149,246,0.25)] hover:brightness-110 active:scale-[0.98]",
        glass:
          "text-[#262626] bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.8),inset_0_-1.5px_1px_0_rgba(255,255,255,0.3),0_4px_16px_rgba(0,0,0,0.06)] hover:bg-white/60 active:scale-[0.98]",
        "ios-droplet":
          "text-[#262626] bg-gradient-to-b from-white/65 via-white/30 to-white/10 backdrop-blur-xl border border-white/70 shadow-[inset_0_2px_1px_0_rgba(255,255,255,0.9),inset_0_-2px_1px_0_rgba(255,255,255,0.25),inset_0_0_14px_2px_rgba(255,255,255,0.2),0_8px_24px_-4px_rgba(0,0,0,0.1),0_2px_6px_-1px_rgba(0,0,0,0.05)] hover:from-white/75 hover:via-white/40 hover:to-white/20 active:scale-[0.97]",
        destructive:
          "bg-[#ED4956] text-white hover:bg-[#DC2626] shadow-sm active:scale-[0.98]",
        outline:
          "border border-[#DBDBDB] bg-white text-[#262626] hover:bg-[#F2F2F2] active:scale-[0.98]",
        secondary:
          "bg-[#EFEFEF] text-[#262626] hover:bg-[#E5E5E5] active:scale-[0.98]",
        ghost:
          "text-[#262626] hover:bg-[#F2F2F2] active:scale-[0.98]",
        link:
          "text-[#0095F6] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <>
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {variant === "ios-droplet" && (
            <>
              <span className="pointer-events-none absolute top-0 left-0 right-0 h-[45%] rounded-t-lg bg-gradient-to-b from-white/70 to-transparent opacity-80" />
              <span
                className="pointer-events-none absolute inset-0 -z-10 rounded-lg"
                style={{
                  backdropFilter: 'blur(12px) url("#ios-droplet-refraction")',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              />
            </>
          )}
          {children}
        </Comp>
        <LiquidGlassFilters />
      </>
    )
  }
)
Button.displayName = "Button"

const liquidbuttonVariants = cva(
  "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full font-bold transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-[#262626] hover:scale-[1.03] active:scale-[0.98]",
        primary: "text-[#0095F6] hover:scale-[1.03] active:scale-[0.98]",
        emerald: "text-[#059669] hover:scale-[1.03] active:scale-[0.98]",
        amber: "text-[#D97706] hover:scale-[1.03] active:scale-[0.98]",
        crimson: "text-[#DC2626] hover:scale-[1.03] active:scale-[0.98]",
        violet: "text-[#7C3AED] hover:scale-[1.03] active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-9 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean
}

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: LiquidButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <>
      <Comp
        data-slot="button"
        className={cn(liquidbuttonVariants({ variant, size, className }))}
        {...props}
      >
        <div
          className="absolute inset-0 z-0 rounded-full border border-white/80 bg-gradient-to-b from-white/70 via-white/35 to-white/15 
          shadow-[inset_0_2.5px_1.5px_0_rgba(255,255,255,0.95),inset_0_-2px_1.5px_0_rgba(255,255,255,0.35),inset_0_0_16px_3px_rgba(255,255,255,0.25),0_10px_28px_-6px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.06)]
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        />
        <div
          className="absolute inset-0 -z-10 rounded-full overflow-hidden"
          style={{
            backdropFilter: 'blur(16px) url("#ios-droplet-refraction")',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[48%] w-[88%] rounded-t-full bg-gradient-to-b from-white/85 via-white/40 to-transparent" />
        <div className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
          {children}
        </div>
      </Comp>
      <LiquidGlassFilters />
    </>
  )
}

type ColorVariant =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "gold"
  | "bronze";

interface MetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ColorVariant;
}

const colorVariants: Record<
  ColorVariant,
  {
    outer: string;
    inner: string;
    button: string;
    textColor: string;
    textShadow: string;
  }
> = {
  default: {
    outer: "bg-gradient-to-b from-[#C4C4C4] to-[#707070]",
    inner: "bg-gradient-to-b from-[#FFFFFF] via-[#E0E0E0] to-[#C0C0C0]",
    button: "bg-gradient-to-b from-[#F5F5F5] to-[#D6D6D6]",
    textColor: "text-[#262626]",
    textShadow: "[text-shadow:_0_1px_0_rgba(255,255,255,0.8)]",
  },
  primary: {
    outer: "bg-gradient-to-b from-[#0095F6] to-[#0066B2]",
    inner: "bg-gradient-to-b from-[#BAE6FD] via-[#0284C7] to-[#0369A1]",
    button: "bg-gradient-to-b from-[#0095F6] to-[#0284C7]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgba(0,0,0,0.3)]",
  },
  success: {
    outer: "bg-gradient-to-b from-[#10B981] to-[#047857]",
    inner: "bg-gradient-to-b from-[#D1FAE5] via-[#059669] to-[#065F46]",
    button: "bg-gradient-to-b from-[#10B981] to-[#059669]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgba(0,0,0,0.3)]",
  },
  error: {
    outer: "bg-gradient-to-b from-[#EF4444] to-[#B91C1C]",
    inner: "bg-gradient-to-b from-[#FEE2E2] via-[#DC2626] to-[#991B1B]",
    button: "bg-gradient-to-b from-[#EF4444] to-[#DC2626]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgba(0,0,0,0.3)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-[#F59E0B] to-[#B45309]",
    inner: "bg-gradient-to-b from-[#FEF3C7] via-[#D97706] to-[#92400E]",
    button: "bg-gradient-to-b from-[#F59E0B] to-[#D97706]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgba(0,0,0,0.3)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-[#864813] to-[#5F2D01]",
    inner: "bg-gradient-to-b from-[#EDC5A1] via-[#864813] to-[#5F2D01]",
    button: "bg-gradient-to-b from-[#A36F3D] to-[#864813]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgba(0,0,0,0.3)]",
  },
};

export const MetalButton = React.forwardRef<HTMLButtonElement, MetalButtonProps>(
  ({ children, className, variant = "default", ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const colors = colorVariants[variant];

    return (
      <div
        className={cn(
          "relative inline-flex transform-gpu rounded-lg p-[1.5px] will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
          colors.outer,
          isPressed ? "translate-y-[1.5px] scale-[0.98]" : "translate-y-0 scale-100"
        )}
      >
        <div className={cn("absolute inset-[1px] rounded-lg", colors.inner)} />
        <button
          ref={ref}
          className={cn(
            "relative z-10 m-[1px] inline-flex h-10 items-center justify-center rounded-lg px-5 py-2 text-sm font-bold cursor-pointer transition-all duration-150 outline-none",
            colors.button,
            colors.textColor,
            colors.textShadow,
            className
          )}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          {...props}
        >
          {children}
        </button>
      </div>
    );
  }
);
MetalButton.displayName = "MetalButton";

export { Button, buttonVariants, liquidbuttonVariants, LiquidButton }


