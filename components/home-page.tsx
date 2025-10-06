'use client'

import { LandingPageOptimized } from "./landing-page-optimized"
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'

export function HomePage() {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState(i18n.language)

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng)
    }

    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  return <LandingPageOptimized key={language} />
}
