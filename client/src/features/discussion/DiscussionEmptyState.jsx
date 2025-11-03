import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

const DiscussionEmptyState = () => {
  const { t } = useI18n()
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('noDiscussionYet')}
          </h3>
          <p className="text-muted-foreground">
            {t('beFirstToPost')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default DiscussionEmptyState

