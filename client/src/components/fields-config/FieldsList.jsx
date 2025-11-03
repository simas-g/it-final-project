import { Type, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DndContext, closestCorners } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDndSensors } from '@/hooks/useDndSensors'
import SortableFieldItem from '@/features/inventory/SortableFieldItem'

const FieldsList = ({ fields, setFields, onUpdate, onRemove, onSave, saving }) => {
  const sensors = useDndSensors()

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => (item.id || item.tempId) === active.id)
        const newIndex = items.findIndex((item) => (item.id || item.tempId) === over.id)
        return arrayMove(items, oldIndex, newIndex).map((field, i) => ({ ...field, order: i }))
      })
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>
          Drag to reorder fields. Click X to remove. Maximum 3 fields per type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Type className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No custom fields added yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Add custom fields from the panel on the right. Each item will have these fields plus the fixed fields (Created By, Created At, Custom ID).
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(f => f.id || f.tempId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <SortableFieldItem
                    key={field.id || field.tempId}
                    field={field}
                    index={index}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={onSave}
            disabled={saving || fields.length === 0}
            className="w-full"
          >
            {saving ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default FieldsList

