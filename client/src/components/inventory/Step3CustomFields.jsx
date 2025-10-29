import { DndContext, closestCorners } from '@dnd-kit/core';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Save, Type, Hash, Calendar, Plus } from "lucide-react";

import { FIELD_TYPES } from "@/lib/inventoryConstants";

import SortableFieldItem from "./SortableFieldItem";

const Step3CustomFields = ({ 
  customFields,
  sensors,
  loading,
  onDragEnd,
  onUpdateField,
  onRemoveField,
  onAddField,
  canAddFieldType,
  getFieldTypeCount,
  onBack,
  onSubmit 
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            Define custom fields for your items (Optional - can be configured later)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customFields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Type className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No custom fields added yet</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add custom fields from the panel on the right. Each item will have these fields plus the fixed fields (Created By, Created At, Custom ID).
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={customFields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {customFields.map((field, index) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      onUpdate={onUpdateField}
                      onRemove={onRemoveField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>

    <div className="space-y-4">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Add Field</CardTitle>
          <CardDescription>Click to add (max 3 per type)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {FIELD_TYPES.map(type => {
            const Icon = type.icon;
            const count = getFieldTypeCount(type.value);
            const canAdd = canAddFieldType(type.value);
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
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-sm">Fixed Fields</CardTitle>
          <CardDescription className="text-xs">Always present in items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center space-x-2 p-2 bg-muted rounded">
            <Hash className="h-3 w-3" />
            <span className="font-medium">Custom ID</span>
            <Badge variant="outline" className="ml-auto text-xs">Auto</Badge>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-muted rounded">
            <Type className="h-3 w-3" />
            <span className="font-medium">Created By</span>
            <Badge variant="outline" className="ml-auto text-xs">Auto</Badge>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-muted rounded">
            <Calendar className="h-3 w-3" />
            <span className="font-medium">Created At</span>
            <Badge variant="outline" className="ml-auto text-xs">Auto</Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="col-span-full flex items-center justify-between pt-6 border-t-2">
      <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button type="submit" disabled={loading} className="min-w-[200px]">
        {loading ? (
          <span className="flex items-center">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
            Creating...
          </span>
        ) : (
          <span className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Create Inventory
          </span>
        )}
      </Button>
    </div>
  </div>
);

export default Step3CustomFields;

