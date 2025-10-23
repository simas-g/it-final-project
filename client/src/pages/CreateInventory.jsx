import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package } from "lucide-react";
import { arrayMove } from '@dnd-kit/sortable';
import { useDndSensors } from "@/hooks/useDndSensors";
import { FIELD_TYPES } from "@/lib/inventoryConstants";
import Step1BasicInfo from "@/components/inventory/Step1BasicInfo";
import Step2CustomId from "@/components/inventory/Step2CustomId";
import Step3CustomFields from "@/components/inventory/Step3CustomFields";

export default function CreateInventory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sensors = useDndSensors();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
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
  const [customFields, setCustomFields] = useState([]);

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
      id: `element-${Date.now()}-${Math.random()}`,
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

  const handleElementDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCustomIdElements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((el, i) => ({ ...el, order: i }));
      });
    }
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
      id: `field-${Date.now()}-${Math.random()}`,
      title: '',
      description: '',
      fieldType,
      isRequired: false,
      showInTable: true,
      order: customFields.length
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

  const handleFieldDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCustomFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((field, i) => ({ ...field, order: i }));
      });
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast({ title: "Inventory name is required", variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (customIdElements.length === 0) {
      toast({ title: "Please add at least one Custom ID element", variant: 'destructive' });
      return false;
    }
    for (let i = 0; i < customIdElements.length; i++) {
      const element = customIdElements[i];
      if (element.elementType === 'FIXED_TEXT' && !element.value) {
        toast({ title: `Element ${i + 1}: Fixed text requires a value`, variant: 'destructive' });
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
    
    if (customFields.length > 0) {
      for (let i = 0; i < customFields.length; i++) {
        if (!customFields[i].title.trim()) {
          toast({ title: `Field ${i + 1}: Title is required`, variant: 'destructive' });
          return;
        }
      }   
    }

    try {
      setLoading(true);
      const inventoryPayload = {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isPublic: formData.isPublic
      };

      const inventoryResponse = await api.post('/inventories', inventoryPayload);
      const inventoryId = inventoryResponse.data.id;

      await api.put(`/inventories/${inventoryId}/custom-id`, { elements: customIdElements });

      if (customFields.length > 0) {
        for (const field of customFields) {
          await api.post(`/inventories/${inventoryId}/fields`, {
            title: field.title,
            description: field.description,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            showInTable: field.showInTable
          });
        }
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
        <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mb-4">
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
          <Step1BasicInfo
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2CustomId
            customIdElements={customIdElements}
            preview={preview}
            sensors={sensors}
            onDragEnd={handleElementDragEnd}
            onUpdateElement={handleUpdateElement}
            onRemoveElement={handleRemoveElement}
            onAddElement={handleAddElement}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {currentStep === 3 && (
          <Step3CustomFields
            customFields={customFields}
            sensors={sensors}
            loading={loading}
            onDragEnd={handleFieldDragEnd}
            onUpdateField={handleUpdateField}
            onRemoveField={handleRemoveField}
            onAddField={handleAddField}
            canAddFieldType={canAddFieldType}
            getFieldTypeCount={getFieldTypeCount}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </form>
    </div>
  );
}
