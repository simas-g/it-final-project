import { useDndSensors } from "@/hooks/useDndSensors";
import {
  CreateInventoryProvider,
  useCreateInventory,
  useFieldManagement,
  InventoryFormHeader,
  StepIndicator,
  Step1BasicInfo,
  Step2CustomId,
  Step3CustomFields
} from "@/features/inventory";

const CreateInventoryContent = () => {
  const sensors = useDndSensors();
  const {
    loading,
    categories,
    currentStep,
    formData,
    customIdElements,
    preview,
    customFields,
    handleInputChange,
    handleImageFileChange,
    handleAddElement,
    handleRemoveElement,
    handleUpdateElement,
    handleElementDragEnd,
    handleAddField,
    handleRemoveField,
    handleUpdateField,
    handleFieldDragEnd,
    handleNext,
    handleBack,
    handleSubmit,
    navigate
  } = useCreateInventory();
  const { getFieldTypeCount, canAddFieldType } = useFieldManagement(customFields);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <InventoryFormHeader 
        currentStep={currentStep}
        onBack={() => navigate('/dashboard')}
      />
      <StepIndicator currentStep={currentStep} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <Step1BasicInfo
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
            onImageFileChange={handleImageFileChange}
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
            onAddField={(fieldType) => handleAddField(fieldType, canAddFieldType)}
            canAddFieldType={canAddFieldType}
            getFieldTypeCount={getFieldTypeCount}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </form>
    </div>
  )
}

const CreateInventory = () => (
  <CreateInventoryProvider>
    <CreateInventoryContent />
  </CreateInventoryProvider>
)

export default CreateInventory
