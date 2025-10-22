import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Image as ImageIcon,
  Tag as TagIcon,
  Lock,
  Globe,
  Hash,
  GripVertical,
  X,
  Plus, 
  Sparkles,
  Calendar,
  Type,
  RefreshCw,
  FileText,
  ToggleLeft
} from "lucide-react";

const FIELD_TYPES = [
  { value: 'SINGLE_LINE_TEXT', label: 'Single Line Text', icon: Type, max: 3 },
  { value: 'MULTI_LINE_TEXT', label: 'Multi Line Text', icon: FileText, max: 3 },
  { value: 'NUMERIC', label: 'Number', icon: Hash, max: 3 },
  { value: 'DOCUMENT_IMAGE', label: 'Document/Image URL', icon: ImageIcon, max: 3 },
  { value: 'BOOLEAN', label: 'Yes/No (Boolean)', icon: ToggleLeft, max: 3 }
];

const ELEMENT_TYPES = [
  { 
    value: 'FIXED_TEXT', 
    label: 'Fixed Text', 
    icon: Type,
    description: 'Static text',
    requiresValue: true,
    requiresFormat: false
  },
  { 
    value: 'RANDOM_6DIGIT', 
    label: '6-Digit Random', 
    icon: Hash,
    description: 'Random 6-digit number',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_9DIGIT', 
    label: '9-Digit Random', 
    icon: Hash,
    description: 'Random 9-digit number',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_20BIT', 
    label: '20-bit Random', 
    icon: Hash,
    description: '20-bit random',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_32BIT', 
    label: '32-bit Random', 
    icon: Hash,
    description: '32-bit random',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'GUID', 
    label: 'GUID', 
    icon: Sparkles,
    description: 'UUID',
    requiresValue: false,
    requiresFormat: false
  },
  { 
    value: 'DATE_TIME', 
    label: 'Date/Time', 
    icon: Calendar,
    description: 'Creation timestamp',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'SEQUENCE', 
    label: 'Sequence', 
    icon: RefreshCw,
    description: 'Auto-increment',
    requiresValue: false,
    requiresFormat: true
  }
];

export default function CreateInventory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    imageUrl: "",
    tags: "",
    isPublic: false
  });

  const [customIdElements, setCustomIdElements] = useState([]);
  const [preview, setPreview] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [customFields, setCustomFields] = useState([]);
  const [draggedFieldIndex, setDraggedFieldIndex] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (customIdElements.length > 0) {
      generatePreview();
    } else {
      setPreview("");
    }
  }, [customIdElements]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generatePreview = async () => {
    try {
      const response = await api.post('/custom-id/preview', { elements: customIdElements });
      setPreview(response.data.preview);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreview('Error generating preview');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddElement = (elementType) => {
    const newElement = {
      elementType,
      format: elementType === 'DATE_TIME' ? 'yyyyMMdd' : 
              elementType.includes('RANDOM') || elementType === 'SEQUENCE' ? 'D6' : '',
      value: elementType === 'FIXED_TEXT' ? '' : null,
      order: customIdElements.length
    };
    setCustomIdElements([...customIdElements, newElement]);
  };

  const handleRemoveElement = (index) => {
    setCustomIdElements(customIdElements.filter((_, i) => i !== index));
  };

  const handleUpdateElement = (index, field, value) => {
    const updated = [...customIdElements];
    updated[index] = { ...updated[index], [field]: value };
    setCustomIdElements(updated);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...customIdElements];
    const draggedElement = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedElement);
    
    setCustomIdElements(updated.map((el, i) => ({ ...el, order: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getElementIcon = (type) => {
    const elementType = ELEMENT_TYPES.find(et => et.value === type);
    return elementType ? elementType.icon : Hash;
  };

  const getElementInfo = (type) => {
    return ELEMENT_TYPES.find(et => et.value === type);
  };

  const getFieldTypeCount = (fieldType) => {
    return customFields.filter(f => f.fieldType === fieldType).length;
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
      order: customFields.length,
      tempId: `temp-${Date.now()}`
    };
    setCustomFields([...customFields, newField]);
  };

  const handleRemoveField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index, fieldName, value) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [fieldName]: value };
    setCustomFields(updated);
  };

  const handleFieldDragStart = (index) => {
    setDraggedFieldIndex(index);
  };

  const handleFieldDragOver = (e, index) => {
    e.preventDefault();
    if (draggedFieldIndex === null || draggedFieldIndex === index) return;

    const updated = [...customFields];
    const draggedField = updated[draggedFieldIndex];
    updated.splice(draggedFieldIndex, 1);
    updated.splice(index, 0, draggedField);
    
    setCustomFields(updated.map((field, i) => ({ ...field, order: i })));
    setDraggedFieldIndex(index);
  };

  const handleFieldDragEnd = () => {
    setDraggedFieldIndex(null);
  };

  const getFieldIcon = (type) => {
    const fieldType = FIELD_TYPES.find(ft => ft.value === type);
    return fieldType ? fieldType.icon : Type;
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Inventory name is required",
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (customIdElements.length === 0) {
      toast({
        title: "Please add at least one Custom ID element",
        variant: 'destructive',
      });
      return false;
    }

    for (let i = 0; i < customIdElements.length; i++) {
      const element = customIdElements[i];
      if (element.elementType === 'FIXED_TEXT' && !element.value) {
        toast({
          title: `Element ${i + 1}: Fixed text requires a value`,
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate custom fields if any
    if (customFields.length > 0) {
      for (let i = 0; i < customFields.length; i++) {
        if (!customFields[i].title.trim()) {
          toast({
            title: `Field ${i + 1}: Title is required`,
            variant: 'destructive',
          });
          return;
        }
      }   
    }

    try {
      const inventoryPayload = {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isPublic: formData.isPublic
      };

      console.log('Creating inventory with payload:', inventoryPayload);
      const inventoryResponse = await api.post('/inventories', inventoryPayload);
      const inventoryId = inventoryResponse.data.id;
      console.log('Inventory created:', inventoryResponse.data);

      console.log('Creating custom ID config:', customIdElements);
      await api.put(`/inventories/${inventoryId}/custom-id`, { elements: customIdElements });
      console.log('Custom ID config created');

      if (customFields.length > 0) {
        console.log('Creating custom fields:', customFields);
        for (const field of customFields) {
          await api.post(`/inventories/${inventoryId}/fields`, {
            title: field.title,
            description: field.description,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            showInTable: field.showInTable
          });
        }
        console.log('Custom fields created');
      }

      navigate(`/inventory/${inventoryId}`);
    } catch (error) {
      console.error('Error creating inventory:', error);
      toast({
        title: error.response?.data?.error || 'Failed to create inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <Button 
          onClick={() => navigate('/dashboard')} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 border-2 rounded-lg flex items-center justify-center">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Create New Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Step {currentStep} of 3: {currentStep === 1 ? 'Basic Information' : currentStep === 2 ? 'Custom ID Configuration' : 'Custom Fields (Optional)'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
              1
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Basic Info</span>
          </div>
          <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
              2
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Custom ID</span>
          </div>
          <div className={`flex-1 h-0.5 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
              3
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Fields</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <>
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Give your inventory a name and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="My Collection"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-11 border-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your inventory..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Categorization</CardTitle>
                <CardDescription>
                  Help others find your inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-sm font-medium">
                      Category
                    </Label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">No category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium flex items-center">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="vintage, rare, collectible (comma separated)"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="h-11 border-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Media & Visibility</CardTitle>
                <CardDescription>
                  Customize how your inventory appears
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="h-11 border-2"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <div className="flex items-center space-x-4 p-4 border-2 rounded-lg">
                    <input
                      type="checkbox"
                      id="isPublic"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-2"
                    />
                    <div className="flex-1">
                      <label htmlFor="isPublic" className="font-medium cursor-pointer flex items-center">
                        {formData.isPublic ? (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Private
                          </>
                        )}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.isPublic 
                          ? "Anyone can view this inventory"
                          : "Only you and people you share with can view this inventory"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={handleNext} size="lg">
                Next: Custom ID Configuration
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
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
                    <div className="space-y-2">
                      {customIdElements.map((element, index) => {
                        const Icon = getElementIcon(element.elementType);
                        const info = getElementInfo(element.elementType);
                        
                        return (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all cursor-move ${
                              draggedIndex === index ? 'opacity-50 scale-95' : 'hover:border-primary'
                            }`}
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="mb-2">{info?.label}</Badge>
                              
                              {info?.requiresValue && (
                                <Input
                                  placeholder="Enter text..."
                                  value={element.value || ''}
                                  onChange={(e) => handleUpdateElement(index, 'value', e.target.value)}
                                  className="mt-2"
                                />
                              )}
                              
                              {info?.requiresFormat && (
                                <Input
                                  placeholder="Format (e.g., D6, yyyy-MM-dd)"
                                  value={element.format || ''}
                                  onChange={(e) => handleUpdateElement(index, 'format', e.target.value)}
                                  className="mt-2"
                                />
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveElement(index)}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    Example of generated ID
                  </CardDescription>
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
                  <CardDescription>
                    Click to add
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ELEMENT_TYPES.map((elementType) => {
                    const Icon = elementType.icon;
                    return (
                      <button
                        key={elementType.value}
                        type="button"
                        onClick={() => handleAddElement(elementType.value)}
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
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex items-center justify-between pt-6 border-t-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={customIdElements.length === 0}
              className="min-w-[200px]"
            >
              Next: Custom Fields (Optional)
            </Button>
          </div>
        )}

        {currentStep === 3 && (
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
                    <div className="space-y-2">
                      {customFields.map((field, index) => {
                        const Icon = getFieldIcon(field.fieldType);
                        const typeInfo = FIELD_TYPES.find(t => t.value === field.fieldType);
                        
                        return (
                          <div
                            key={field.tempId}
                            draggable
                            onDragStart={() => handleFieldDragStart(index)}
                            onDragOver={(e) => handleFieldDragOver(e, index)}
                            onDragEnd={handleFieldDragEnd}
                            className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-move ${
                              draggedFieldIndex === index ? 'opacity-50 scale-95' : 'hover:border-primary'
                            }`}
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                            <Icon className="h-5 w-5 flex-shrink-0 mt-2" />
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">{typeInfo?.label}</Badge>
                              </div>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Field Title *"
                                  value={field.title}
                                  onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
                                />
                                <Input
                                  placeholder="Description (shown as hint)"
                                  value={field.description || ''}
                                  onChange={(e) => handleUpdateField(index, 'description', e.target.value)}
                                />
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.isRequired}
                                    onChange={(e) => handleUpdateField(index, 'isRequired', e.target.checked)}
                                    className="w-4 h-4 rounded border-2"
                                  />
                                  <span>Required</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.showInTable}
                                    onChange={(e) => handleUpdateField(index, 'showInTable', e.target.checked)}
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
                              onClick={() => handleRemoveField(index)}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex items-center justify-between pt-6 border-t-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[200px]"
            >
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
        )}
      </form>
    </div>
  );
}
