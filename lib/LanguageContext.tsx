'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { en, kn } from './dictionaries'

type Language = 'en' | 'kn'
type Dictionary = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof Dictionary) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'kn')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    console.log("Setting language to:", lang)
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: keyof Dictionary): string => {
    const dict = language === 'en' ? en : kn
    const translation = dict[key] || en[key] || key
    return translation
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
