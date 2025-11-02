import { createContext, useContext, useReducer, useEffect } from 'react'

import api from '@/lib/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {

  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await api.get('/auth/me')
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token: token
            }
          })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      console.log('Attempting login with:', { email })
      const response = await api.post('/auth/login', { email, password })
      console.log('Login response:', response.data)
      const { user, token } = response.data
      localStorage.setItem('token', token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })
      return { success: true }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data?.error || error.message || 'Login failed'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email, password, name) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      console.log('Attempting registration with:', { email, name })
      const response = await api.post('/auth/register', { email, password, name })
      console.log('Registration response:', response.data)
      const { user, token } = response.data
      localStorage.setItem('token', token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })
      return { success: true }
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const setError = (error) => {
    dispatch({ type: 'LOGIN_FAILURE', payload: error })
  }

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me')
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: localStorage.getItem('token')
        }
      })
    } catch (error) {
      throw error
    }
  }

  const isAdmin = () => state.user?.role === 'ADMIN'

  const isCreator = () => state.user?.role === 'CREATOR' || state.user?.role === 'ADMIN'

  const isAuthenticated = () => !!state.user

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    setError,
    loadUser,
    isAdmin,
    isCreator,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {

  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
