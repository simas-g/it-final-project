import { createContext, useContext, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { prepareFieldValues } from '@/lib/fieldUtils'
import { hasItemWriteAccess } from '@/lib/permissions'

const ItemDetailContext = createContext()

export const ItemDetailProvider = ({ children, item }) => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { getTranslation, language } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({})
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const liked = item?.likes?.some(like => like.userId === user?.id) || false
  const hasWriteAccess = hasItemWriteAccess(item, user)
  const updateItemMutation = useMutation({
    mutationFn: (data) => api.put(`/items/${item.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['item', item.id])
      setIsEditing(false)
      setEditValues({})
      toast({
        title: getTranslation('success', language),
        description: getTranslation('itemUpdated', language)
      })
    },
    onError: (error) => {
      toast({
        title: getTranslation('error', language),
        description: error.response?.data?.error || getTranslation('errorUpdatingItem', language),
        variant: 'destructive'
      })
    }
  })
  const toggleLikeMutation = useMutation({
    mutationFn: () => api.post(`/items/${item.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries(['item', item.id])
    },
    onError: (error) => {
      toast({
        title: getTranslation('error', language),
        description: getTranslation('errorTogglingLike', language),
        variant: 'destructive'
      })
    }
  })
  const deleteItemMutation = useMutation({
    mutationFn: () => api.delete(`/items/${item.id}`),
    onSuccess: () => {
      toast({
        title: getTranslation('success', language),
        description: getTranslation('itemDeleted', language)
      })
      navigate(`/inventory/${item.inventory.id}`)
    },
    onError: (error) => {
      toast({
        title: getTranslation('error', language),
        description: error.response?.data?.error || getTranslation('errorDeletingItem', language),
        variant: 'destructive'
      })
    }
  })
  const startEditing = () => {
    const initialValues = {}
    if (item?.inventory?.fields) {
      item.inventory.fields.forEach(field => {
        const existingValue = item.fields?.[field.id]
        if (field.fieldType === 'BOOLEAN') {
          initialValues[field.id] = existingValue === true || existingValue === 'true'
        } else {
          initialValues[field.id] = existingValue || ''
        }
      })
    }
    setEditValues(initialValues)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditValues({})
  }

  const handleFieldChange = (fieldId, value) => {
    setEditValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSaveEdit = () => {
    const preparedFields = prepareFieldValues(item.inventory.fields, editValues)
    updateItemMutation.mutate({
      fields: preparedFields,
      version: item.version
    })
  }

  const handleToggleLike = () => {
    toggleLikeMutation.mutate()
  }

  const handleDelete = () => {
    setConfirmDialogOpen(true)
  }

  const confirmDelete = () => {
    deleteItemMutation.mutate()
  }

  const value = {
    item,
    liked,
    hasWriteAccess,
    isEditing,
    editValues,
    saving: updateItemMutation.isPending,
    isAuthenticated: isAuthenticated(),
    startEditing,
    cancelEditing,
    handleFieldChange,
    handleSaveEdit,
    handleToggleLike,
    handleDelete,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmDelete
  }

  return (
    <ItemDetailContext.Provider value={value}>
      {children}
    </ItemDetailContext.Provider>
  )
}

export const useItemDetail = () => {
  const context = useContext(ItemDetailContext)
  if (!context) {
    throw new Error('useItemDetail must be used within an ItemDetailProvider')
  }
  return context
}

