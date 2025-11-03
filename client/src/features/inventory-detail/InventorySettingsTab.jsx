import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Hash, Package, Info, Tag as TagIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/ui/image-upload'
import { useInventoryDetail } from './InventoryDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const InventorySettingsTab = () => {
  const { inventory } = useInventoryDetail()
  const { t } = useI18n()
  const { toast } = useToast()
  const [categories, setCategories] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: inventory.name || '',
    description: inventory.description || '',
    categoryId: inventory.categoryId || '',
    imageFile: null,
    tags: inventory.inventoryTags?.map(it => it.tag.name).join(', ') || ''
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageFileChange = (file) => {
    setFormData(prev => ({ ...prev, imageFile: file }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: t('inventoryNameRequired'), variant: 'destructive' })
      return
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
      setIsEditing(false)
      window.location.reload()
    } catch (error) {
      console.error('Error updating inventory:', error)
      toast({
        title: error.response?.data?.error || t('errorUpdatingInventory'),
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: inventory.name || '',
      description: inventory.description || '',
      categoryId: inventory.categoryId || '',
      imageFile: null,
      tags: inventory.inventoryTags?.map(it => it.tag.name).join(', ') || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('basicInformation')}</CardTitle>
              <CardDescription>{t('updateInventoryDetails')}</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                {t('edit')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? t('saving') : t('save')}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('nameRequired')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-11 border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="categoryId">{t('category')}</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">{t('noCategory')}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags">{t('tags')}</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder={t('tagsPlaceholder')}
                  className="h-11 border-2"
                />
                <p className="text-xs text-muted-foreground">{t('separateTagsWithCommas')}</p>
              </div>

              <div className="space-y-2">
                <Label>{t('inventoryImage')}</Label>
                <ImageUpload
                  value={formData.imageFile}
                  onChange={handleImageFileChange}
                  onError={(error) => {
                    toast({ title: error, variant: 'destructive' })
                  }}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{inventory.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {inventory.description || t('noDescription')}
                  </p>
                  {inventory.category && (
                    <div className="mt-3">
                      <Badge variant="secondary">{inventory.category.name}</Badge>
                    </div>
                  )}
                  {inventory.inventoryTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {inventory.inventoryTags.map((it) => (
                        <Badge key={it.id} variant="outline" className="text-xs">
                          <TagIcon className="h-3 w-3 mr-1" />
                          {it.tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('configuration')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between p-4 border-2 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Hash className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('customIdFormat')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('configureCustomIdDescription')}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to={`/inventory/${inventory.id}/custom-id`}>
                {t('configure')}
              </Link>
            </Button>
          </div>
          <div className="flex items-start justify-between p-4 border-2 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('customFields')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('defineCustomFieldsDescription')}
                </p>
                {inventory?.fields?.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {inventory.fields.length} field{inventory.fields.length !== 1 ? 's' : ''} configured
                  </p>
                )}
              </div>
            </div>
            <Button asChild>
              <Link to={`/inventory/${inventory.id}/fields`}>
                {t('configure')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InventorySettingsTab

