import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Hash, Sparkles, Plus } from "lucide-react";
import { ELEMENT_TYPES } from "@/lib/inventoryConstants";
import SortableElementItem from "./SortableElementItem";

const Step2CustomId = ({ 
  customIdElements, 
  preview, 
  sensors,
  onDragEnd,
  onUpdateElement,
  onRemoveElement,
  onAddElement,
  onBack,
  onNext 
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hash className="mr-2 h-5 w-5" />
            Custom ID Elements <span className="text-destructive ml-1">*</span>
          </CardTitle>
          <CardDescription>
            Drag to reorder. Click X to remove. At least one element required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customIdElements.length === 0 ? (
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
                items={customIdElements.map(el => el.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {customIdElements.map((element, index) => (
                    <SortableElementItem
                      key={element.id}
                      element={element}
                      index={index}
                      onUpdate={onUpdateElement}
                      onRemove={onRemoveElement}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>Example of generated ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-lg break-all">
            {preview || 'Add elements to see preview'}
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="space-y-4">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Available Elements</CardTitle>
          <CardDescription>Click to add</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {ELEMENT_TYPES.map((elementType) => {
            const Icon = elementType.icon;
            return (
              <button
                key={elementType.value}
                type="button"
                onClick={() => onAddElement(elementType.value)}
                disabled={customIdElements.length >= 10}
                className="w-full text-left p-3 border-2 rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{elementType.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {elementType.description}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </button>
            );
          })}
          
          {customIdElements.length >= 10 && (
            <Alert>
              <AlertDescription className="text-xs">
                Maximum 10 elements reached
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>

    <div className="col-span-full flex items-center justify-between pt-6 border-t-2">
      <Button type="button" variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button
        type="button"
        onClick={onNext}
        disabled={customIdElements.length === 0}
        className="min-w-[200px]"
      >
        Next: Custom Fields (Optional)
      </Button>
    </div>
  </div>
);

export default Step2CustomId;

