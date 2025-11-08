import { useI18n } from '@/contexts/I18nContext'

export const StepIndicator = ({ currentStep }) => {
  const { t } = useI18n()
  const steps = [
    { number: 1, label: t('basicInfo') },
    { number: 2, label: t('customId') },
    { number: 3, label: t('fieldsShort') }
  ]
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <>
            <div key={step.number} className={`flex items-center ${currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= step.number ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                {step.number}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${currentStep >= step.number + 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            )}
          </>
        ))}
      </div>
    </div>
  )
}

