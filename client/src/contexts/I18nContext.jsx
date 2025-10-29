import { createContext, useContext, useMemo } from 'react'

import { useTheme } from './ThemeContext'

import enTranslations from '../locales/en.json'

import esTranslations from '../locales/es.json'

import plTranslations from '../locales/pl.json'

const I18nContext = createContext()

const translations = {
  en: enTranslations,
  es: esTranslations,
  pl: plTranslations
}

export const I18nProvider = ({ children }) => {

  const { language } = useTheme()

  const value = useMemo(() => {
    const getTranslation = (key, lang, params = {}) => {
      const targetLanguage = lang || language || 'en'
      let text = translations[targetLanguage]?.[key] || translations['en']?.[key] || key
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param])
      })
      return text
    }

    const t = (key, params = {}) => {
      return getTranslation(key, language, params)
    }

    return {
      getTranslation,
      t,
      translations,
      language
    }
  }, [language])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {

  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
