import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useI18n } from "@/contexts/I18nContext";
import { 
  CreateItemProvider, 
  useCreateItem,
  ItemFormHeader,
  ItemFormField
} from "@/features/item";
import { CustomIdPreview } from "@/components/ui/custom-id-preview";
import { Save, Package, AlertCircle } from "lucide-react";

const CreateItemContent = () => {
  const { t } = useI18n();
  const {
    loading,
    fetchingInventory,
    error,
    inventory,
    customFields,
    fieldValues,
    previewId,
    inventoryId,
    handleFieldChange,
    handleSubmit,
    navigate
  } = useCreateItem();
  if (fetchingInventory) {
    return <LoadingSpinner message={t('loadingInventory')} />;
  }
  if (!inventory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('inventoryNotFound')}</h2>
          <Button asChild>
            <Link to="/dashboard">{t('backToDashboard')}</Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ItemFormHeader 
        inventoryName={inventory.name}
        onBack={() => navigate(`/inventory/${inventoryId}`)}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <CustomIdPreview 
          preview={previewId}
          hasCustomId={!!inventory.customIdConfig}
          variant="default"
        />
        {customFields.length > 0 ? (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('itemDetails')}</CardTitle>
              <CardDescription>
                {t('fillInCustomFields')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {customFields.map((field) => (
                <ItemFormField 
                  key={field.id}
                  field={field}
                  value={fieldValues[field.id]}
                  onChange={handleFieldChange}
                />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2">
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t('noCustomFields')}</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {t('noCustomFieldsDescription')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/inventory/${inventoryId}/fields`)}
                >
                  {t('configureFields')}
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
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[150px]"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                {t('creating')}
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                {t('createItem')}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

const CreateItem = () => (
  <CreateItemProvider>
    <CreateItemContent />
  </CreateItemProvider>
)

export default CreateItem

