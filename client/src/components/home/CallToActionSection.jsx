import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

const CallToActionSection = () => {
  const { isAuthenticated } = useAuth()
  const { t } = useI18n()
  
  if (isAuthenticated()) return null
  
  return (
    <section className="text-center space-y-6 py-12 sm:py-16 border-t">
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold">
          {t('startManagingToday')}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto px-4">
          {t('joinPlatform')}
        </p>
      </div>
      <Button size="lg" asChild>
        <Link to="/register">
          {t('createFreeAccount')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </section>
  )
}

export default CallToActionSection

