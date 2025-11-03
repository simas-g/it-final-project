import { Button } from '@/components/ui/button'
import { ArrowLeft, Package } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const InventoryFormHeader = ({ currentStep, onBack }) => {
  const { t } = useI18n()

  const getStepName = (step) => {
    switch(step) {
      case 1: return t('basicInformation')
      case 2: return t('customIdConfiguration')
      case 3: return t('customFieldsOptional')
      default: return ''
    }
  }

  return (
    <div className="mb-8">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backToDashboard')}
      </Button>
      
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 border-2 rounded-lg flex items-center justify-center">
          <Package className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('createNewInventory')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('stepOf', { step: currentStep, total: 3 })}: {getStepName(currentStep)}
          </p>
        </div>
      </div>
    </div>
  )
}

