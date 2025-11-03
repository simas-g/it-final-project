import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { arrayMove } from '@dnd-kit/sortable'

const CustomIdConfigContext = createContext(null)

export const useCustomIdConfig = () => {
  const context = useContext(CustomIdConfigContext)
  if (!context) {
    throw new Error('useCustomIdConfig must be used within CustomIdConfigProvider')
  }
  return context
}

export const CustomIdConfigProvider = ({ children }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [inventory, setInventory] = useState(null)
  const [elements, setElements] = useState([])
  const [preview, setPreview] = useState('')
  const [showHelp, setShowHelp] = useState({})

  useEffect(() => {
    fetchInventory()
    fetchConfig()
  }, [id])

  useEffect(() => {
    if (elements.length > 0) {
      generatePreview()
    }
  }, [elements])

  const fetchInventory = async () => {
    try {
      const response = await api.get(`/inventories/${id}`)
      setInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError('Failed to load inventory')
    }
  }

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/inventories/${id}/custom-id`)
      if (response.data && response.data.elementsList) {
        setElements(response.data.elementsList.sort((a, b) => a.order - b.order))
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePreview = async () => {
    try {
      const response = await api.post('/custom-id/preview', { elements })
      setPreview(response.data.preview)
    } catch (error) {
      console.error('Error generating preview:', error)
      setPreview('Error generating preview')
    }
  }

  const handleAddElement = (elementType) => {
    const newElement = {
      id: `element-${Date.now()}-${Math.random()}`,
      elementType,
      format: elementType === 'DATE_TIME' ? 'yyyyMMdd' : 
              elementType.includes('RANDOM') || elementType === 'SEQUENCE' ? 'D6' : '',
      value: elementType === 'FIXED_TEXT' ? '' : null,
      order: elements.length
    }
    setElements([...elements, newElement])
  }

  const handleRemoveElement = (index) => {
    setElements(elements.filter((_, i) => i !== index))
  }

  const handleUpdateElement = (index, field, value) => {
    const updated = [...elements]
    updated[index] = { ...updated[index], [field]: value }
    setElements(updated)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex((item) => (item.id || `element-${items.indexOf(item)}`) === active.id)
        const newIndex = items.findIndex((item) => (item.id || `element-${items.indexOf(item)}`) === over.id)
        return arrayMove(items, oldIndex, newIndex).map((el, i) => ({ ...el, order: i }))
      })
    }
  }

  const handleToggleHelp = (index) => {
    setShowHelp({ ...showHelp, [index]: !showHelp[index] })
  }

  const handleSave = async () => {
    if (elements.length === 0) {
      setError('Please add at least one element')
      return
    }
    if (elements.length > 10) {
      setError('Maximum 10 elements allowed')
      return
    }
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      if (element.elementType === 'FIXED_TEXT' && !element.value) {
        setError(`Element ${i + 1}: Fixed text requires a value`)
        return
      }
    }
    try {
      setSaving(true)
      setError('')
      await api.put(`/inventories/${id}/custom-id`, { elements })
      setSuccess('Custom ID configuration saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setError(error.response?.data?.error || 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const value = {
    loading,
    saving,
    error,
    success,
    inventory,
    elements,
    preview,
    showHelp,
    id,
    handleAddElement,
    handleRemoveElement,
    handleUpdateElement,
    handleDragEnd,
    handleToggleHelp,
    handleSave,
    navigate
  }

  return (
    <CustomIdConfigContext.Provider value={value}>
      {children}
    </CustomIdConfigContext.Provider>
  )
}

