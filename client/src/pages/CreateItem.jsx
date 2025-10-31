import { useState, useEffect } from "react";

import { useParams, useNavigate, Link } from "react-router-dom";


import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";


import { api } from "@/lib/api";
import { prepareFieldValues, initializeFieldValues, validateFields } from "@/lib/fieldUtils";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  ArrowLeft, 
  Save, 
  Package, 
  AlertCircle,
  Hash,
} from "lucide-react";

export default function CreateItem() {
  const { id: inventoryId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingInventory, setFetchingInventory] = useState(true);
  const [error, setError] = useState("");
  const [inventory, setInventory] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [previewId, setPreviewId] = useState("");
  useEffect(() => {
    fetchInventory();
  }, [inventoryId]);
  useEffect(() => {
    if (inventory?.customIdConfig) {
      generatePreviewId();
    }
  }, [inventory]);
  const fetchInventory = async () => {
    try {
      setFetchingInventory(true);
      const response = await api.get(`/inventories/${inventoryId}`);
      setInventory(response.data);
      setCustomFields(response.data.fields || []);
      setFieldValues(initializeFieldValues(response.data.fields || []));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory');
    } finally {
      setFetchingInventory(false);
    }
  };
  const generatePreviewId = async () => {
    if (!inventory?.customIdConfig?.elementsList) return;
    try {
      const response = await api.post('/custom-id/preview', { 
        elements: inventory.customIdConfig.elementsList 
      });
      setPreviewId(response.data.preview);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };
  const handleFieldChange = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  const validateForm = () => {
    const validation = validateFields(customFields, fieldValues);
    if (!validation.isValid) {
      setError(validation.error);
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const preparedFields = prepareFieldValues(customFields, fieldValues);
      const payload = {
        fields: preparedFields
      };
      const response = await api.post(`/inventories/${inventoryId}/items`, payload);
      navigate(`/inventory/${inventoryId}`);
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error.response?.data?.error || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };
  if (fetchingInventory) {
    return <LoadingSpinner message="Loading inventory..." />;
  }
  if (!inventory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Inventory not found</h2>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Button 
          onClick={() => navigate(`/inventory/${inventoryId}`)} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 border-2 rounded-lg flex items-center justify-center">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Add New Item</h1>
            <p className="text-muted-foreground mt-1">
              to {inventory.name}
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {inventory.customIdConfig && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="mr-2 h-5 w-5" />
                Custom ID
              </CardTitle>
              <CardDescription>
                The ID will be auto-generated automatically when you save the item
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Example ID format:</p>
                  <p className="font-mono text-sm">{previewId}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your actual ID will be generated on the server
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {customFields.length > 0 ? (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Fill in the custom fields for this item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {customFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.title}
                    {field.isRequired && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                  {field.fieldType === 'SINGLE_LINE_TEXT' && (
                    <Input
                      id={field.id}
                      type="text"
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      required={field.isRequired}
                      className="h-11 border-2"
                    />
                  )}
                  {field.fieldType === 'MULTI_LINE_TEXT' && (
                    <textarea
                      id={field.id}
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      required={field.isRequired}
                      className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                  {field.fieldType === 'NUMERIC' && (
                    <Input
                      id={field.id}
                      type="number"
                      step="any"
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      required={field.isRequired}
                      className="h-11 border-2"
                    />
                  )}
                  {field.fieldType === 'IMAGE_URL' && (
                    <Input
                      id={field.id}
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      required={field.isRequired}
                      className="h-11 border-2"
                    />
                  )}
                  {field.fieldType === 'BOOLEAN' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={field.id}
                        checked={fieldValues[field.id] === true || fieldValues[field.id] === 'true'}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                        className="w-4 h-4 rounded border-2"
                      />
                      <label htmlFor={field.id} className="text-sm cursor-pointer">
                        {field.title}
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2">
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Custom Fields</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  This inventory doesn't have any custom fields defined yet. The item will be created with just the custom ID.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/inventory/${inventoryId}/fields`)}
                >
                  Configure Fields
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="flex items-center justify-between pt-6 border-t-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/inventory/${inventoryId}`)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[150px]"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                Creating...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Create Item
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

