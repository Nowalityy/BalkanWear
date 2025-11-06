'use client'

import { useState, useEffect } from 'react'
import { getTranslations, type Translations, type Locale, defaultLocale } from '@/lib/i18n'

export function setLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale)
    // Dispatch event to notify all components
    window.dispatchEvent(new Event('localechange'))
  }
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale
    if (stored && ['en', 'sr'].includes(stored)) {
      return stored
    }
  }
  return defaultLocale
}

export function useTranslation() {
  // Always start with defaultLocale to avoid hydration mismatch
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Set mounted flag and load locale from localStorage after mount
    setMounted(true)
    setLocaleState(getLocale())
    
    // Listen for locale changes
    const handleLocaleChange = () => {
      setLocaleState(getLocale())
    }
    
    window.addEventListener('localechange', handleLocaleChange)
    return () => window.removeEventListener('localechange', handleLocaleChange)
  }, [])

  const translations = getTranslations(locale)

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found`)
        return key
      }
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }
    
    return value
  }

  return { t, locale, setLocale }
}
