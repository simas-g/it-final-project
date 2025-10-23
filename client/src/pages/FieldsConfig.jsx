import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Save, 
  GripVertical,
  X,
  Plus,
  Type,
  Hash,
  AlertCircle,
  Info
} from "lucide-react";
import { DndContext, closestCorners } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDndSensors } from "@/hooks/useDndSensors";
import { FIELD_TYPES } from "@/lib/inventoryConstants";

const SortableFieldItem = ({ field, index, onUpdate, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id || field.tempId });

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
      className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all ${
        isDragging ? 'scale-95 z-50' : 'hover:border-primary'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-move mt-2">
        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
      <Icon className="h-5 w-5 flex-shrink-0 mt-2" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline">{typeInfo?.label}</Badge>
          {field.isNew && <Badge>New</Badge>}
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

export default function FieldsConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inventory, setInventory] = useState(null);
  const [fields, setFields] = useState([]);
  const sensors = useDndSensors();

  useEffect(() => {
    fetchInventoryAndFields();
  }, [id]);

  const fetchInventoryAndFields = async () => {
    try {
      setLoading(true);
      const [invResponse, fieldsResponse] = await Promise.all([
        api.get(`/inventories/${id}`),
        api.get(`/inventories/${id}/fields`)
      ]);
      setInventory(invResponse.data);
      setFields(fieldsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeCount = (fieldType) => {
    return fields.filter(f => f.fieldType === fieldType).length;
  };

  const canAddFieldType = (fieldType) => {
    const typeInfo = FIELD_TYPES.find(t => t.value === fieldType);
    return getFieldTypeCount(fieldType) < typeInfo.max;
  };

  const handleAddField = (fieldType) => {
    if (!canAddFieldType(fieldType)) return;

    const newField = {
      title: '',
      description: '',
      fieldType,
      isRequired: false,
      showInTable: true,
      order: fields.length,
      isNew: true,
      tempId: `temp-${Date.now()}`
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = async (index) => {
    const field = fields[index];
    
    if (field.isNew) {
      setFields(fields.filter((_, i) => i !== index));
    } else {
      try {
        await api.delete(`/fields/${field.id}`);
        setFields(fields.filter((_, i) => i !== index));
        setSuccess('Field deleted successfully');
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error('Error deleting field:', error);
        setError(error.response?.data?.error || 'Failed to delete field');
      }
    }
  };

  const handleUpdateField = (index, fieldName, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [fieldName]: value };
    setFields(updated);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => (item.id || item.tempId) === active.id);
        const newIndex = items.findIndex((item) => (item.id || item.tempId) === over.id);
        
        return arrayMove(items, oldIndex, newIndex).map((field, i) => ({ ...field, order: i }));
      });
    }
  };

  const handleSave = async () => {
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].title.trim()) {
        setError(`Field ${i + 1}: Title is required`);
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      
      const newFields = fields.filter(f => f.isNew);
      for (const field of newFields) {
        await api.post(`/inventories/${id}/fields`, {
          title: field.title,
          description: field.description,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          showInTable: field.showInTable
        });
      }

      const existingFields = fields.filter(f => !f.isNew);
      for (const field of existingFields) {
        await api.put(`/fields/${field.id}`, {
          title: field.title,
          description: field.description,
          isRequired: field.isRequired,
          showInTable: field.showInTable
        });
      }

      const fieldOrders = fields.map((field, index) => ({
        fieldId: field.id || field.tempId,
        order: index
      })).filter(fo => !fo.fieldId.startsWith('temp-'));

      if (fieldOrders.length > 0) {
        await api.put(`/inventories/${id}/fields/reorder`, { fieldOrders });
      }

      setSuccess('Fields configuration saved successfully!');
      setTimeout(() => {
        setSuccess("");
        fetchInventoryAndFields(); // Refresh
      }, 1500);
    } catch (error) {
      console.error('Error saving fields:', error);
      setError(error.response?.data?.error || 'Failed to save fields');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button onClick={() => navigate(`/inventory/${id}`)} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <h1 className="text-3xl font-bold">Custom Fields Configuration</h1>
        <div className="w-32"></div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Field Limits:</strong> You can add up to 3 fields of each type. Fixed fields (Created By, Created At, Custom ID) are automatically included in all items.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                          onUpdate={handleUpdateField}
                          onRemove={handleRemoveField}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSave}
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
        </div>

        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Add Field</CardTitle>
              <CardDescription>
                Click to add (max 3 per type)
              </CardDescription>
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
                    onClick={() => handleAddField(type.value)}
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
              <CardDescription className="text-xs">
                Always present in items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <Hash className="h-3 w-3" />
                <span className="font-medium">Custom ID</span>
                <Badge variant="outline" className="ml-auto text-xs">Editable</Badge>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <Type className="h-3 w-3" />
                <span className="font-medium">Created By</span>
                <Badge variant="outline" className="ml-auto text-xs">Auto</Badge>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <Type className="h-3 w-3" />
                <span className="font-medium">Created At</span>
                <Badge variant="outline" className="ml-auto text-xs">Auto</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
