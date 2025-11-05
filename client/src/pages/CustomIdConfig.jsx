import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";
import {
  CustomIdConfigProvider,
  useCustomIdConfig,
  ElementsPanel,
  AvailableElementsPanel
} from "@/features/custom-id";
import { CustomIdPreview } from "@/components/ui/custom-id-preview";

const CustomIdConfigContent = () => {
  const {
    loading,
    saving,
    error,
    success,
    elements,
    preview,
    showHelp,
    id,
    handleAddElement,
    handleRemoveElement,
    handleUpdateElement,
    handleDragEnd,
    handleToggleHelp,
    handleSave,
    navigate
  } = useCustomIdConfig()

  if (loading) {
    return <LoadingSpinner message="Loading configuration..." />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center flex-wrap justify-between">
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
          <ElementsPanel
            elements={elements}
            saving={saving}
            showHelp={showHelp}
            onDragEnd={handleDragEnd}
            onUpdate={handleUpdateElement}
            onRemove={handleRemoveElement}
            onToggleHelp={handleToggleHelp}
            onSave={handleSave}
          />
          <CustomIdPreview preview={preview} variant="live" />
        </div>

        <div className="space-y-4">
          <AvailableElementsPanel
            elements={elements}
            onAddElement={handleAddElement}
          />
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
  )
}

const CustomIdConfig = () => (
  <CustomIdConfigProvider>
    <CustomIdConfigContent />
  </CustomIdConfigProvider>
)

export default CustomIdConfig

