"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CardHoverRevealContextValue {
  isHovered: boolean
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>
}

const CardHoverRevealContext = React.createContext<CardHoverRevealContextValue | undefined>(undefined)

const useCardHoverRevealContext = () => {
  const context = React.useContext(CardHoverRevealContext)
  if (!context) {
    throw new Error("CardHoverReveal bileşenleri doğru sırada kullanılmalıdır")
  }
  return context
}

interface CardHoverRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  withFocus?: boolean;
  aspectRatio?: "auto" | "square" | "video" | "portrait";
  animationSpeed?: "fast" | "normal" | "slow";
}

const CardHoverReveal = React.forwardRef<
  HTMLDivElement,
  CardHoverRevealProps
>(({ 
  className, 
  withFocus = true, 
  aspectRatio = "auto",
  animationSpeed = "normal",
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = React.useState<boolean>(false)

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)
  const handleFocus = withFocus ? () => setIsHovered(true) : undefined
  const handleBlur = withFocus ? () => setIsHovered(false) : undefined

  const aspectRatioClass = 
    aspectRatio === "square" ? "aspect-square" : 
    aspectRatio === "video" ? "aspect-video" : 
    aspectRatio === "portrait" ? "aspect-[3/4]" : "";

  const animationSpeedClass = 
    animationSpeed === "fast" ? "hover:shadow-md" :
    animationSpeed === "slow" ? "hover:shadow-lg duration-500" :
    "hover:shadow-md duration-300";

  return (
    <CardHoverRevealContext.Provider value={{ isHovered, setIsHovered }}>
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all", 
          aspectRatioClass,
          withFocus && "focus-within:ring-1 focus-within:ring-[#100049]/20",
          animationSpeedClass,
          "group rounded-lg",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={withFocus ? 0 : undefined}
        role="group"
        {...props}
      />
    </CardHoverRevealContext.Provider>
  )
})
CardHoverReveal.displayName = "CardHoverReveal"

interface CardHoverRevealMainProps extends React.HTMLAttributes<HTMLDivElement> {
  initialScale?: number
  hoverScale?: number
  overlayColor?: string
  overlayOpacity?: number
  transitionSpeed?: "fast" | "normal" | "slow";
}

const CardHoverRevealMain = React.forwardRef<
  HTMLDivElement,
  CardHoverRevealMainProps
>(({ 
  className, 
  initialScale = 1, 
  hoverScale = 1.02,
  overlayColor = "#000000",
  overlayOpacity = 0,
  transitionSpeed = "normal",
  ...props 
}, ref) => {
  const { isHovered } = useCardHoverRevealContext()
  
  const transitionDuration = 
    transitionSpeed === "fast" ? "duration-200" :
    transitionSpeed === "slow" ? "duration-500" :
    "duration-300";
  
  return (
    <div 
      ref={ref}
      className={cn(
        "relative w-full h-full overflow-hidden",
        "transition-all ease-out",
        transitionDuration,
        className
      )}
      {...props}
    >
      <div 
        className={cn("w-full h-full transition-transform ease-out", transitionDuration)}
        style={{
          transform: `scale(${isHovered ? hoverScale : initialScale})`,
        }}
      >
        {props.children}
      </div>
      {overlayOpacity > 0 && (
        <div 
          className={cn("absolute inset-0 transition-opacity pointer-events-none", transitionDuration)}
          style={{
            backgroundColor: overlayColor,
            opacity: isHovered ? overlayOpacity : 0,
          }}
        />
      )}
    </div>
  )
})
CardHoverRevealMain.displayName = "CardHoverRevealMain"

interface CardHoverRevealContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showDelay?: number;
  hideDelay?: number;
  position?: "bottom" | "top" | "center" | "full" | "bottom-compact" | "elegant";
  backdropBlur?: boolean;
  maxHeight?: string;
  glassMorphism?: boolean;
}

const CardHoverRevealContent = React.forwardRef<
  HTMLDivElement,
  CardHoverRevealContentProps
>(({ 
  className, 
  showDelay = 0, 
  hideDelay = 0, 
  position = "bottom",
  backdropBlur = true,
  maxHeight,
  glassMorphism = false,
  ...props 
}, ref) => {
  const { isHovered } = useCardHoverRevealContext()
  
  const positionClasses = {
    "bottom": "inset-[auto_0_0_0]",
    "bottom-compact": "inset-[auto_0_0_0] max-h-[60%]",
    "elegant": "inset-x-2 bottom-2 top-auto rounded-lg max-h-[75%]",
    "top": "inset-[0_0_auto_0]",
    "center": "inset-0 flex items-center justify-center",
    "full": "inset-0",
  };
  
  const translateY = 
    position === "bottom" || position === "bottom-compact" ? "0% 100%" : 
    position === "elegant" ? "0% 90%" :
    position === "top" ? "0% -100%" : 
    "0% 0%";

  return (
    <div
      ref={ref}
      className={cn(
        "absolute transition-all ease-out",
        backdropBlur && (glassMorphism ? "backdrop-blur-md" : "backdrop-blur-sm"),
        positionClasses[position],
        glassMorphism ? "bg-white/40 border border-white/30" : "bg-white/95",
        position === "elegant" ? "p-4 shadow-xl" : "p-3 shadow-md",
        isHovered ? "overflow-hidden" : "overflow-hidden",
        className
      )}
      style={{
        transform: `translate(${isHovered ? "0% 0%" : translateY})`,
        opacity: isHovered ? 1 : 0,
        transitionDuration: isHovered ? `${showDelay + 250}ms` : `${hideDelay + 200}ms`,
        maxHeight: maxHeight || (position === "elegant" ? "75%" : undefined),
        ...props.style
      }}
      aria-hidden={!isHovered}
      {...props}
    />
  )
})
CardHoverRevealContent.displayName = "CardHoverRevealContent"

export { CardHoverReveal, CardHoverRevealMain, CardHoverRevealContent }
