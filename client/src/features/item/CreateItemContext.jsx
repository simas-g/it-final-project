import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { prepareFieldValues, initializeFieldValues, validateFields } from '@/lib/fieldUtils'
import { useI18n } from './I18nContext'

const CreateItemContext = createContext(null)

export const useCreateItem = () => {
  const context = useContext(CreateItemContext)
  if (!context) {
    throw new Error('useCreateItem must be used within CreateItemProvider')
  }
  return context
}

export const CreateItemProvider = ({ children }) => {
  const { t } = useI18n()
  const { id: inventoryId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchingInventory, setFetchingInventory] = useState(true)
  const [error, setError] = useState('')
  const [inventory, setInventory] = useState(null)
  const [customFields, setCustomFields] = useState([])
  const [fieldValues, setFieldValues] = useState({})
  const [previewId, setPreviewId] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [inventoryId])

  useEffect(() => {
    if (inventory?.customIdConfig) {
      generatePreviewId()
    }
  }, [inventory])

  const fetchInventory = async () => {
    try {
      setFetchingInventory(true)
      const response = await api.get(`/inventories/${inventoryId}`)
      setInventory(response.data)
      setCustomFields(response.data.fields || [])
      setFieldValues(initializeFieldValues(response.data.fields || []))
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError(t('failedToLoadInventory'))
    } finally {
      setFetchingInventory(false)
    }
  }

  const generatePreviewId = async () => {
    if (!inventory?.customIdConfig?.elementsList) return
    try {
      const response = await api.post('/custom-id/preview', { 
        elements: inventory.customIdConfig.elementsList 
      })
      setPreviewId(response.data.preview)
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  const handleFieldChange = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const validateForm = () => {
    const validation = validateFields(customFields, fieldValues)
    if (!validation.isValid) {
      setError(validation.error)
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    setLoading(true)
    setError('')
    try {
      const preparedFields = prepareFieldValues(customFields, fieldValues)
      const payload = {
        fields: preparedFields
      }
      await api.post(`/inventories/${inventoryId}/items`, payload)
      navigate(`/inventory/${inventoryId}`)
    } catch (error) {
      console.error('Error creating item:', error)
      setError(error.response?.data?.error || t('failedToCreateItem'))
    } finally {
      setLoading(false)
    }
  }

  const value = {
    loading,
    fetchingInventory,
    error,
    inventory,
    customFields,
    fieldValues,
    previewId,
    inventoryId,
    handleFieldChange,
    handleSubmit,
    navigate
  }

  return (
    <CreateItemContext.Provider value={value}>
      {children}
    </CreateItemContext.Provider>
  )
}

