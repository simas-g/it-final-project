import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Hash, Package, Tag as TagIcon, KeyRound, RefreshCw, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import ImageUpload from '@/components/ui/image-upload'
import { useInventoryDetail } from './InventoryDetailContext'
import { useI18n } from '@/contexts/I18nContext'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories, generateInventoryApiToken } from '@/queries/api'
import { useInventoryUpdate } from './useInventoryUpdate'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

const getInitialFormData = (inventory) => ({
  name: inventory.name || '',
  description: inventory.description || '',
  categoryId: inventory.categoryId || '',
  imageFile: null,
  tags: inventory.inventoryTags?.map(it => it.tag.name).join(', ') || ''
})

const InventorySettingsTab = () => {
  const { inventory } = useInventoryDetail()
  const { t } = useI18n()
  const { toast } = useToast()
  const { updateInventory, saving } = useInventoryUpdate(inventory)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(getInitialFormData(inventory))
  const [apiToken, setApiToken] = useState('')
  const [tokenLoading, setTokenLoading] = useState(false)
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
  const queryClient = useQueryClient()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageFileChange = (file) => {
    setFormData(prev => ({ ...prev, imageFile: file }))
  }

  const handleSave = async () => {
    const success = await updateInventory(formData)
    if (success) {
      setIsEditing(false)
      window.location.reload()
    }
  }

  const handleCancel = () => {
    setFormData(getInitialFormData(inventory))
    setIsEditing(false)
  }

  const handleGenerateToken = async () => {
    if (tokenLoading) return
    try {
      setTokenLoading(true)
      const { token } = await generateInventoryApiToken(inventory.id)
      setApiToken(token)
      queryClient.invalidateQueries({ queryKey: ['inventory-detail', inventory.id] })
      toast({ title: t('apiTokenCreatedTitle'), description: t('apiTokenCreatedDescription') })
    } catch (error) {
      const message = error.response?.data?.error || t('apiTokenError')
      toast({ title: t('apiTokenError'), description: message, variant: 'destructive' })
    } finally {
      setTokenLoading(false)
    }
  }

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: t('copiedToClipboard') })
    } catch (_error) {
      toast({ title: t('clipboardUnavailable'), variant: 'destructive' })
    }
  }

  const formatDate = (value) => {
    if (!value) return t('notAvailable')
    return new Date(value).toLocaleString()
  }

  const baseEndpoint = `${backendUrl}/api/external/inventories/aggregations`
  const odooUrl = import.meta.env.VITE_ODOO_URL || 'http://localhost:8069'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                {t('apiTokenTitle')}
              </CardTitle>
              <CardDescription>{t('apiTokenDescription')}</CardDescription>
            </div>
            <Button onClick={handleGenerateToken} disabled={tokenLoading}>
              {tokenLoading ? t('generating') : inventory.apiTokenGeneratedAt ? t('regenerateToken') : t('generateToken')}
              <RefreshCw className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {t('apiTokenWarning')}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">{t('lastGeneratedAt')}</p>
              <p className="font-medium">{formatDate(inventory.apiTokenGeneratedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">{t('lastUsedAt')}</p>
              <p className="font-medium">{formatDate(inventory.apiTokenLastUsedAt)}</p>
            </div>
          </div>
          {apiToken ? (
            <div className="space-y-4">
              <div>
                <Label>{t('apiTokenLabel')}</Label>
                <div className="flex gap-2 mt-2">
                  <Input readOnly value={apiToken} />
                  <Button variant="outline" onClick={() => copyToClipboard(apiToken)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('apiTokenUsageInstructions')}
                </p>
              </div>
              <div>
                <Label>{t('endpointLabel')}</Label>
                <div className="flex gap-2 mt-2">
                  <Input readOnly value={baseEndpoint} />
                  <Button variant="outline" onClick={() => copyToClipboard(baseEndpoint)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('endpointHelp')}
                </p>
              </div>
              <div className="rounded-md border p-3 bg-muted/50">
                <p className="text-sm font-medium mb-2">{t('howToUseTitle')}</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>{t('howToUseStep1')}</li>
                  <li>
                    {t('howToUseStep2')}{' '}
                    <a 
                      href={odooUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {odooUrl}
                    </a>
                  </li>
                  <li>{t('howToUseStep3')}</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {t('noTokenYet')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InventorySettingsTab

