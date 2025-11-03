import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FIELD_TYPES } from '@/lib/inventoryConstants'

const FieldTypeButtons = ({ fields, onAddField }) => {
  const getFieldTypeCount = (fieldType) => {
    return fields.filter(f => f.fieldType === fieldType).length
  }

  const canAddFieldType = (fieldType) => {
    const typeInfo = FIELD_TYPES.find(t => t.value === fieldType)
    return getFieldTypeCount(fieldType) < typeInfo.max
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Add Field</CardTitle>
        <CardDescription>
          Click to add (max 3 per type)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {FIELD_TYPES.map(type => {
          const Icon = type.icon
          const count = getFieldTypeCount(type.value)
          const canAdd = canAddFieldType(type.value)
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onAddField(type.value)}
              disabled={!canAdd}
              className="w-full text-left p-3 border-2 rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {count} / {type.max} used
                    </p>
                  </div>
                </div>
                {canAdd && (
                  <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default FieldTypeButtons

