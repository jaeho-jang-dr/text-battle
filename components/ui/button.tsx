import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonVariants as animationVariants } from "@/lib/animations"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl active:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus-visible:ring-blue-500",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus-visible:ring-red-500",
        outline:
          "border-2 border-gray-600 bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white focus-visible:ring-gray-500",
        secondary:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus-visible:ring-gray-500",
        ghost: "hover:bg-gray-800 text-gray-300 hover:text-white shadow-none hover:shadow-lg",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 shadow-none",
        success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 focus-visible:ring-green-500",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 focus-visible:ring-yellow-500",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
      glow: {
        true: "",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, asChild = false, isLoading = false, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const glowStyles = {
      default: glow ? "glow-blue" : "",
      destructive: glow ? "glow-red" : "",
      success: glow ? "glow-green" : "",
      warning: glow ? "shadow-lg shadow-yellow-500/50" : "",
    };
    
    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            variant && glowStyles[variant as keyof typeof glowStyles]
          )}
          ref={ref}
          {...props}
        />
      )
    }
    
    return (
      <motion.button
        className={cn(
          buttonVariants({ variant, size, className }),
          variant && glowStyles[variant as keyof typeof glowStyles]
        )}
        ref={ref}
        disabled={disabled || isLoading}
        variants={animationVariants}
        whileHover={!disabled && !isLoading ? "hover" : undefined}
        whileTap={!disabled && !isLoading ? "tap" : undefined}
        animate={disabled || isLoading ? "disabled" : "initial"}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {loadingText && <span>{loadingText}</span>}
          </div>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }