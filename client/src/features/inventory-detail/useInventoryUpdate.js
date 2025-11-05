import { useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/I18nContext'

export const useInventoryUpdate = (inventory) => {
  const { toast } = useToast()
  const { t } = useI18n()
  const [saving, setSaving] = useState(false)

  const updateInventory = async (formData) => {
    if (!formData.name.trim()) {
      toast({ title: t('inventoryNameRequired'), variant: 'destructive' })
      return false
    }

    setSaving(true)
    try {
      let imageUrl = inventory.imageUrl

      if (formData.imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('image', formData.imageFile)
        const imageResponse = await api.post('/upload/image', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        imageUrl = imageResponse.data.url
      }

      await api.put(`/inventories/${inventory.id}`, {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        imageUrl: imageUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isPublic: inventory.isPublic,
        version: inventory.version
      })

      toast({ title: t('inventoryUpdated') })
      return true
    } catch (error) {
      console.error('Error updating inventory:', error)
      toast({
        title: error.response?.data?.error || t('errorUpdatingInventory'),
        variant: 'destructive'
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  return { updateInventory, saving }
}

