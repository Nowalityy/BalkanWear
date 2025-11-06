import en from '@/locales/en.json'
import srb from '@/locales/srb.json'

export type Locale = 'en' | 'sr'

export const defaultLocale: Locale = 'en'
export const locales: Locale[] = ['en', 'sr']

export type Translations = typeof en

// Translations for all supported locales
const translations: Record<Locale, Translations> = {
  en,
  sr: srb, // Serbian translations
}

export function getTranslations(locale: Locale = defaultLocale): Translations {
  return translations[locale] || translations[defaultLocale]
}

export function t(key: string, locale: Locale = defaultLocale, params?: Record<string, string | number>): string {
  const translations = getTranslations(locale)
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
