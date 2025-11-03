import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/contexts/I18nContext'

export const ItemFormField = ({ field, value, onChange }) => {
  const { t } = useI18n()

  const renderFieldInput = () => {
    switch (field.fieldType) {
      case 'SINGLE_LINE_TEXT':
        return (
          <Input
            id={field.id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.isRequired}
            className="h-11 border-2"
          />
        )
      
      case 'MULTI_LINE_TEXT':
        return (
          <textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.isRequired}
            className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )
      
      case 'NUMERIC':
        return (
          <Input
            id={field.id}
            type="number"
            step="any"
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.isRequired}
            className="h-11 border-2"
          />
        )
      
      case 'IMAGE_URL':
        return (
          <Input
            id={field.id}
            type="url"
            placeholder={t('imageUrlPlaceholder')}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.isRequired}
            className="h-11 border-2"
          />
        )
      
      case 'BOOLEAN':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value === true || value === 'true'}
              onChange={(e) => onChange(field.id, e.target.checked)}
              className="w-4 h-4 rounded border-2"
            />
            <label htmlFor={field.id} className="text-sm cursor-pointer">
              {field.title}
            </label>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div key={field.id} className="space-y-2">
      <Label htmlFor={field.id} className="text-sm font-medium">
        {field.title}
        {field.isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      {renderFieldInput()}
    </div>
  )
}

