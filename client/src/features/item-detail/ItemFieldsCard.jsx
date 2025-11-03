import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useItemDetail } from './ItemDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const ItemFieldsCard = () => {
  const { item, isEditing, editValues, handleFieldChange } = useItemDetail()
  const { t } = useI18n()
  
  const fields = item.inventory.fields
  const itemFields = item.fields

  if (!fields || fields.length === 0) return null

  const renderField = (field) => {
    if (isEditing) {
      return (
        <div key={field.id}>
          <Label className="text-sm font-medium text-muted-foreground">
            {field.title}
            {field.isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.fieldType === 'SINGLE_LINE_TEXT' && (
            <Input
              type="text"
              value={editValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.isRequired}
              className="mt-1"
            />
          )}
          {field.fieldType === 'MULTI_LINE_TEXT' && (
            <textarea
              value={editValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.isRequired}
              className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring mt-1"
            />
          )}
          {field.fieldType === 'NUMERIC' && (
            <Input
              type="number"
              step="any"
              value={editValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.isRequired}
              className="mt-1"
            />
          )}
          {field.fieldType === 'IMAGE_URL' && (
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={editValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.isRequired}
              className="mt-1"
            />
          )}
          {field.fieldType === 'BOOLEAN' && (
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="checkbox"
                checked={editValues[field.id] === true || editValues[field.id] === 'true'}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="w-4 h-4 rounded border-2"
              />
              <label className="text-sm cursor-pointer">
                {field.title}
              </label>
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={field.id}>
        <Label className="text-sm font-medium text-muted-foreground">
          {field.title}
          {field.isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="mt-1">
          {field.fieldType === 'BOOLEAN' ? (
            <p className="text-sm">
              {itemFields?.[field.id] ? t('yes') : t('no')}
            </p>
          ) : field.fieldType === 'IMAGE_URL' && itemFields?.[field.id] ? (
            <img 
              src={itemFields[field.id]} 
              alt={field.title}
              className="max-w-full h-auto max-h-64 rounded-lg border shadow-sm"
            />
          ) : (
            <p className="text-sm">
              {itemFields?.[field.id] || t('notSet')}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('itemDetails')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map(renderField)}
        </div>
      </CardContent>
    </Card>
  )
}

export default ItemFieldsCard

