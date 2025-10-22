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
  Plus,
  GripVertical,
  X,
  HelpCircle,
  Sparkles,
  Hash,
  Calendar,
  Type,
  RefreshCw
} from "lucide-react";

const ELEMENT_TYPES = [
  { 
    value: 'FIXED_TEXT', 
    label: 'Fixed Text', 
    icon: Type,
    description: 'Static text that appears in every ID',
    helpText: 'Enter any text (supports Unicode characters)',
    requiresValue: true,
    requiresFormat: false
  },
  { 
    value: 'RANDOM_6DIGIT', 
    label: '6-Digit Random', 
    icon: Hash,
    description: 'Random 6-digit number (0-999,999)',
    helpText: 'Format: D6 for zero-padded (e.g., 000123), or leave empty',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_9DIGIT', 
    label: '9-Digit Random', 
    icon: Hash,
    description: 'Random 9-digit number (0-999,999,999)',
    helpText: 'Format: D9 for zero-padded, X9 for hexadecimal',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_20BIT', 
    label: '20-bit Random', 
    icon: Hash,
    description: '20-bit random number (0-1,048,575)',
    helpText: 'Format: D7 for zero-padded decimal, X5 for hexadecimal',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'RANDOM_32BIT', 
    label: '32-bit Random', 
    icon: Hash,
    description: '32-bit random number (0-4,294,967,295)',
    helpText: 'Format: D10 for zero-padded decimal, X8 for hexadecimal',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'GUID', 
    label: 'GUID', 
    icon: Sparkles,
    description: 'Globally Unique Identifier (UUID)',
    helpText: 'Generates a standard UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)',
    requiresValue: false,
    requiresFormat: false
  },
  { 
    value: 'DATE_TIME', 
    label: 'Date/Time', 
    icon: Calendar,
    description: 'Current date/time when item is created',
    helpText: 'Format examples: yyyy (year), MM (month), dd (day), HH (hour), mm (minute), ss (second). Example: yyyyMMdd gives 20251015',
    requiresValue: false,
    requiresFormat: true
  },
  { 
    value: 'SEQUENCE', 
    label: 'Sequence Number', 
    icon: RefreshCw,
    description: 'Auto-incrementing number (resets per inventory)',
    helpText: 'Format: D4 for zero-padded (e.g., 0001, 0002)',
    requiresValue: false,
    requiresFormat: true
  }
];

export default function CustomIdConfig() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inventory, setInventory] = useState(null);
  const [elements, setElements] = useState([]);
  const [preview, setPreview] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showHelp, setShowHelp] = useState({});

  useEffect(() => {
    fetchInventory();
    fetchConfig();
  }, [id]);

  useEffect(() => {
    if (elements.length > 0) {
      generatePreview();
    }
  }, [elements]);

  const fetchInventory = async () => {
    try {
      const response = await api.get(`/inventories/${id}`);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory');
    }
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inventories/${id}/custom-id`);
      if (response.data && response.data.elementsList) {
        setElements(response.data.elementsList.sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      // Config might not exist yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      const response = await api.post('/custom-id/preview', { elements });
      setPreview(response.data.preview);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreview('Error generating preview');
    }
  };

  const handleAddElement = (elementType) => {
    const newElement = {
      elementType,
      format: elementType === 'DATE_TIME' ? 'yyyyMMdd' : 
              elementType.includes('RANDOM') || elementType === 'SEQUENCE' ? 'D6' : '',
      value: elementType === 'FIXED_TEXT' ? '' : null,
      order: elements.length
    };
    setElements([...elements, newElement]);
  };

  const handleRemoveElement = (index) => {
    setElements(elements.filter((_, i) => i !== index));
  };

  const handleUpdateElement = (index, field, value) => {
    const updated = [...elements];
    updated[index] = { ...updated[index], [field]: value };
    setElements(updated);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...elements];
    const draggedElement = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedElement);
    
    setElements(updated.map((el, i) => ({ ...el, order: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (elements.length === 0) {
      setError('Please add at least one element');
      return;
    }

    if (elements.length > 10) {
      setError('Maximum 10 elements allowed');
      return;
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.elementType === 'FIXED_TEXT' && !element.value) {
        setError(`Element ${i + 1}: Fixed text requires a value`);
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      await api.put(`/inventories/${id}/custom-id`, { elements });
      setSuccess('Custom ID configuration saved successfully!');
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setError(error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const getElementIcon = (type) => {
    const elementType = ELEMENT_TYPES.find(et => et.value === type);
    return elementType ? elementType.icon : Hash;
  };

  const getElementInfo = (type) => {
    return ELEMENT_TYPES.find(et => et.value === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate(`/inventory/${id}`)} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <h1 className="text-3xl font-bold">Custom ID Configuration</h1>
        <div className="w-32"></div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                <div className="space-y-2">
                  {elements.map((element, index) => {
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
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{info?.label}</Badge>
                            {showHelp[index] && (
                              <p className="text-xs text-muted-foreground">{info?.helpText}</p>
                            )}
                          </div>
                          
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
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowHelp({ ...showHelp, [index]: !showHelp[index] })}
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                        <Button
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

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSave}
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

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                This is how the generated ID will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg font-mono text-lg break-all">
                {preview || 'No preview available'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Random numbers and GUIDs will be different for each item
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Available Elements</CardTitle>
              <CardDescription>
                Click to add to your ID format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ELEMENT_TYPES.map((elementType) => {
                const Icon = elementType.icon;
                return (
                  <button
                    key={elementType.value}
                    onClick={() => handleAddElement(elementType.value)}
                    disabled={elements.length >= 10}
                    className="w-full text-left p-3 border-2 rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{elementType.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {elementType.description}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
              
              {elements.length >= 10 && (
                <Alert>
                  <AlertDescription className="text-xs">
                    Maximum 10 elements reached
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm">Format Examples</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <p className="font-medium">Numbers:</p>
                <p className="text-muted-foreground">D6 = 000123 (zero-padded)</p>
                <p className="text-muted-foreground">X8 = 0000007B (hexadecimal)</p>
              </div>
              <div>
                <p className="font-medium">Date/Time:</p>
                <p className="text-muted-foreground">yyyyMMdd = 20251015</p>
                <p className="text-muted-foreground">yyyy-MM-dd = 2025-10-15</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

