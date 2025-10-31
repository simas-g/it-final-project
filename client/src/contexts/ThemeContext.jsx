import { createContext, useContext, useReducer, useEffect } from 'react'

const ThemeContext = createContext()

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'en'
}

function themeReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }
    case 'TOGGLE_THEME':
      return { 
        ...state, 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      }
    default:
      return state
  }
}

export function ThemeProvider({ children }) {

  const [state, dispatch] = useReducer(themeReducer, initialState)

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(state.theme)
    localStorage.setItem('theme', state.theme)
  }, [state.theme])

  useEffect(() => {
    localStorage.setItem('language', state.language)
  }, [state.language])

  const setTheme = (theme) => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }

  const setLanguage = (language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language })
  }

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' })
  }

  const value = {
    ...state,
    setTheme,
    setLanguage,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {

  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
