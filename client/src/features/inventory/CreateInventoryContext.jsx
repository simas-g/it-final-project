import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/I18nContext'
import { arrayMove } from '@dnd-kit/sortable'

const CreateInventoryContext = createContext(null)

export const useCreateInventory = () => {
  const context = useContext(CreateInventoryContext)
  if (!context) {
    throw new Error('useCreateInventory must be used within CreateInventoryProvider')
  }
  return context
}

export const CreateInventoryProvider = ({ children }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    imageFile: null,
    tags: '',
    isPublic: false
  })
  const [customIdElements, setCustomIdElements] = useState([])
  const [preview, setPreview] = useState('')
  const [customFields, setCustomFields] = useState([])
  useEffect(() => {
    fetchCategories()
  }, [])
  useEffect(() => {
    if (customIdElements.length > 0) {
      generatePreview()
    } else {
      setPreview('')
    }
  }, [customIdElements])
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  const generatePreview = async () => {
    try {
      const response = await api.post('/custom-id/preview', { elements: customIdElements })
      setPreview(response.data.preview)
    } catch (error) {
      console.error('Error generating preview:', error)
      setPreview(t('errorGeneratingPreview'))
    }
  }
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value
    }))
  }
  
  const handleImageFileChange = (file) => {
    setFormData(prev => ({
      ...prev,
      imageFile: file
    }))
  }

  const handleAddElement = (elementType) => {
    const newElement = {
      id: `element-${Date.now()}-${Math.random()}`,
      elementType,
      format: elementType === 'DATE_TIME' ? 'yyyyMMdd' : 
              elementType.includes('RANDOM') || elementType === 'SEQUENCE' ? 'D6' : '',
      value: elementType === 'FIXED_TEXT' ? '' : null,
      order: customIdElements.length
    }
    setCustomIdElements([...customIdElements, newElement])
  }

  const handleRemoveElement = (index) => {
    setCustomIdElements(customIdElements.filter((_, i) => i !== index))
  }

  const handleUpdateElement = (index, field, value) => {
    const updated = [...customIdElements]
    updated[index] = { ...updated[index], [field]: value }
    setCustomIdElements(updated)
  }

  const handleElementDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setCustomIdElements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex).map((el, i) => ({ ...el, order: i }))
      })
    }
  }

  const handleAddField = (fieldType, canAddFieldType) => {
    if (!canAddFieldType(fieldType)) return
    const newField = {
      id: `field-${Date.now()}-${Math.random()}`,
      title: '',
      description: '',
      fieldType,
      isRequired: false,
      showInTable: true,
      order: customFields.length
    }
    setCustomFields([...customFields, newField])
  }

  const handleRemoveField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleUpdateField = (index, fieldName, value) => {
    const updated = [...customFields]
    updated[index] = { ...updated[index], [fieldName]: value }
    setCustomFields(updated)
  }

  const handleFieldDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setCustomFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex).map((field, i) => ({ ...field, order: i }))
      })
    }
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast({ title: t('inventoryNameRequired'), variant: 'destructive' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (customIdElements.length === 0) {
      toast({ title: t('addAtLeastOneElement'), variant: 'destructive' })
      return false
    }
    for (let i = 0; i < customIdElements.length; i++) {
      const element = customIdElements[i]
      if (element.elementType === 'FIXED_TEXT' && !element.value) {
        toast({ title: t('elementFixedTextRequired', { number: i + 1 }), variant: 'destructive' })
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (customFields.length > 0) {
      for (let i = 0; i < customFields.length; i++) {
        if (!customFields[i].title.trim()) {
          toast({ title: t('fieldTitleRequired', { number: i + 1 }), variant: 'destructive' })
          return
        }
      }   
    }
    try {
      setLoading(true)
      
      let imageUrl = undefined
      if (formData.imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('image', formData.imageFile)
        
        const imageResponse = await api.post('/upload/image', imageFormData, { headers: { 'Content-Type': 'multipart/form-data' } })
        imageUrl = imageResponse.data.url
      }
      
      const inventoryPayload = {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        imageUrl: imageUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isPublic: formData.isPublic
      }
      const inventoryResponse = await api.post('/inventories', inventoryPayload)
      const inventoryId = inventoryResponse.data.id
      await api.put(`/inventories/${inventoryId}/custom-id`, { elements: customIdElements })
      if (customFields.length > 0) {
        for (const field of customFields) {
          await api.post(`/inventories/${inventoryId}/fields`, {
            title: field.title,
            description: field.description,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            showInTable: field.showInTable
          })
        }
      }
      navigate(`/inventory/${inventoryId}`)
    } catch (error) {
      console.error('Error creating inventory:', error)
      toast({
        title: error.response?.data?.error || t('failedToCreateInventory'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const value = {
    loading,
    categories,
    currentStep,
    formData,
    customIdElements,
    preview,
    customFields,
    handleInputChange,
    handleImageFileChange,
    handleAddElement,
    handleRemoveElement,
    handleUpdateElement,
    handleElementDragEnd,
    handleAddField,
    handleRemoveField,
    handleUpdateField,
    handleFieldDragEnd,
    handleNext,
    handleBack,
    handleSubmit,
    navigate
  }

  return (
    <CreateInventoryContext.Provider value={value}>
      {children}
    </CreateInventoryContext.Provider>
  )
}

