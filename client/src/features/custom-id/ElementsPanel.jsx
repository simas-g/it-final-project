import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Hash, Save } from 'lucide-react'
import { DndContext, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDndSensors } from '@/hooks/useDndSensors'
import { SortableElementItem } from './SortableElementItem'

export const ElementsPanel = ({ elements, saving, showHelp, onDragEnd, onUpdate, onRemove, onToggleHelp, onSave }) => {
  const sensors = useDndSensors()

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>ID Elements</CardTitle>
        <CardDescription>
          Drag and drop to reorder elements. Drag outside to remove.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {elements.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No elements added yet</p>
            <p className="text-sm text-muted-foreground">Add elements from the right panel to start building your custom ID</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={elements.map(el => el.id || `element-${elements.indexOf(el)}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {elements.map((element, index) => (
                  <SortableElementItem
                    key={element.id || `element-${index}`}
                    element={element}
                    index={index}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    showHelp={showHelp}
                    onToggleHelp={onToggleHelp}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <div className="pt-4 border-t">
          <Button
            onClick={onSave}
            disabled={saving || elements.length === 0}
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

