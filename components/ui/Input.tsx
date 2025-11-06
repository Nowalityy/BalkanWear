import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  as?: "input" | "textarea"
  rows?: number
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, className, as = "input", rows, ...props }, ref) => {
    const Component = as === "textarea" ? "textarea" : "input"
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[#111827] mb-2.5">
            {label}
          </label>
        )}
        <Component
          ref={ref as any}
          className={cn(
            "w-full px-4 py-3.5 border-2 border-[#E5E7EB] rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-[#54a3ac]/20 focus:border-[#54a3ac]",
            "disabled:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60",
            "transition-all duration-200 ease-out bg-white text-[#111827]",
            "placeholder:text-[#9CA3AF] placeholder:font-normal",
            "hover:border-[#D1E7E9]",
            error && "border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]",
            as === "textarea" && "resize-none",
            className
          )}
          rows={as === "textarea" ? rows : undefined}
          {...(props as any)}
        />
        {error && (
          <p className="mt-2 text-sm font-medium text-[#EF4444] flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
