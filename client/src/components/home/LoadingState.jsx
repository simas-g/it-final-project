import { useI18n } from '@/contexts/I18nContext'

const LoadingState = () => {
  const { t } = useI18n()
  
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  )
}

export default LoadingState

