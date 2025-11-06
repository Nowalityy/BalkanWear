import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  children: ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "font-medium rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#54a3ac]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none relative overflow-hidden group"
  
  const variants = {
    primary: "bg-[#54a3ac] text-white hover:bg-[#4a8f96] hover:shadow-lg hover:shadow-[#54a3ac]/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md shadow-md shadow-[#54a3ac]/20",
    secondary: "bg-white text-[#111827] border-2 border-[#E5E7EB] hover:border-[#54a3ac] hover:bg-[#F0F9FA] hover:shadow-md active:shadow-sm",
    outline: "border-2 border-[#54a3ac] text-[#54a3ac] bg-transparent hover:bg-[#54a3ac] hover:text-white hover:shadow-lg hover:shadow-[#54a3ac]/25 hover:-translate-y-0.5 active:translate-y-0",
    ghost: "text-[#6B7280] hover:bg-[#F0F9FA] hover:text-[#54a3ac] active:bg-[#E8F4F5]",
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] hover:shadow-lg hover:shadow-[#EF4444]/25 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-[#EF4444]/20",
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
      )}
    </button>
  )
}
