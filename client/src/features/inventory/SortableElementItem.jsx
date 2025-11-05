import { useSortable } from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import { GripVertical, X, Hash } from "lucide-react";

import { ELEMENT_TYPES } from "@/lib/inventoryConstants";

const SortableElementItem = ({ element, index, onUpdate, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  const Icon = ELEMENT_TYPES.find(et => et.value === element.elementType)?.icon || Hash;
  const info = ELEMENT_TYPES.find(et => et.value === element.elementType);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-4 border-2 rounded-lg ${
        isDragging ? 'z-50' : 'hover:border-primary'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Badge variant="outline" className="mb-2">{info?.label}</Badge>
        {info?.requiresValue && (
          <Input
            placeholder="Enter text..."
            value={element.value || ''}
            onChange={(e) => onUpdate(index, 'value', e.target.value)}
            className="mt-2"
          />
        )}
        {info?.requiresFormat && (
          <Input
            placeholder="Format (e.g., D6, yyyy-MM-dd)"
            value={element.format || ''}
            onChange={(e) => onUpdate(index, 'format', e.target.value)}
            className="mt-2"
          />
        )}
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

export default SortableElementItem;

