import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../locales/en/common.json'
import fr from '../locales/fr/common.json'
import es from '../locales/es/common.json'
import de from '../locales/de/common.json'
import af from '../locales/af/common.json'
import zh from '../locales/zh/common.json'
import ja from '../locales/ja/common.json'
import hi from '../locales/hi/common.json'
import ar from '../locales/ar/common.json'
import sw from '../locales/sw/common.json'

const resources = {
  en: {
    translation: en
  },
  fr: {
    translation: fr
  },
  es: {
    translation: es
  },
  de: {
    translation: de
  },
  af: {
    translation: af
  },
  zh: {
    translation: zh
  },
  ja: {
    translation: ja
  },
  hi: {
    translation: hi
  },
  ar: {
    translation: ar
  },
  sw: {
    translation: sw
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Set initial language
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n
