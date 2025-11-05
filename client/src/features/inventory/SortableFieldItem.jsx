import { useSortable } from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import { GripVertical, X, Type } from "lucide-react";

import { FIELD_TYPES } from "@/lib/inventoryConstants";

const SortableFieldItem = ({ field, index, onUpdate, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const Icon = FIELD_TYPES.find(ft => ft.value === field.fieldType)?.icon || Type;
  const typeInfo = FIELD_TYPES.find(t => t.value === field.fieldType);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start space-x-3 p-4 border-2 rounded-lg ${
        isDragging ? 'z-50' : 'hover:border-primary'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-move mt-2">
        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
      <Icon className="h-5 w-5 flex-shrink-0 mt-2" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline">{typeInfo?.label}</Badge>
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Field Title *"
            value={field.title}
            onChange={(e) => onUpdate(index, 'title', e.target.value)}
          />
          <Input
            placeholder="Description (shown as hint)"
            value={field.description || ''}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.isRequired}
              onChange={(e) => onUpdate(index, 'isRequired', e.target.checked)}
              className="w-4 h-4 rounded border-2"
            />
            <span>Required</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.showInTable}
              onChange={(e) => onUpdate(index, 'showInTable', e.target.checked)}
              className="w-4 h-4 rounded border-2"
            />
            <span>Show in table</span>
          </label>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        className="hover:bg-destructive hover:text-destructive-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SortableFieldItem;

