"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslation, setLocale } from "@/hooks/useTranslation"
import { type Locale } from "@/lib/i18n"

const languages: { code: Locale; flag: string }[] = [
  { code: "en", flag: "🇺🇸" },
  { code: "sr", flag: "🇷🇸" },
]

export function LanguageSelector() {
  const { locale } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Set mounted flag after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSelectLanguage = (code: Locale) => {
    setLocale(code)
    setIsOpen(false)
    // Force page refresh to update all translations
    window.location.reload()
  }

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]
  const displayFlag = mounted ? currentLanguage.flag : languages[0].flag

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-1.5 py-1.5 text-base hover:bg-[#E8F4F5] rounded-lg transition-all duration-200 ease-in-out"
        aria-label="Select language"
      >
        <span>{displayFlag}</span>
        <svg
          className={`w-3 h-3 text-[#6B7280] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && mounted && (
        <div className="absolute right-0 mt-2 w-12 bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-[#D1E7E9] overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`w-full flex items-center justify-center py-2 text-lg transition-colors ${
                locale === lang.code
                  ? "bg-[#E8F4F5]"
                  : "hover:bg-[#E8F4F5]"
              }`}
              title={lang.code === "en" ? "English" : "Српски"}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
