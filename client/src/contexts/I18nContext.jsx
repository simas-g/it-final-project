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
      const translationObj = translations[targetLanguage] || translations['en'] || {}
      const keys = key.split('.')
      let text = translationObj
      for (const k of keys) {
        if (text && typeof text === 'object') {
          text = text[k]
        } else {
          text = undefined
          break
        }
      }
      if (typeof text !== 'string') {
        const fallbackObj = translations['en'] || {}
        let fallbackText = fallbackObj
        for (const k of keys) {
          if (fallbackText && typeof fallbackText === 'object') {
            fallbackText = fallbackText[k]
          } else {
            fallbackText = undefined
            break
          }
        }
        text = typeof fallbackText === 'string' ? fallbackText : key
      }
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
