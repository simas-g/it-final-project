import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, Lock } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { useAccessManagement } from './AccessManagementContext'

export const PublicAccessCard = () => {
  const { t } = useI18n()
  const { isPublic, handleTogglePublic, submitting } = useAccessManagement()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {isPublic ? <Globe className="h-5 w-5 mr-2" /> : <Lock className="h-5 w-5 mr-2" />}
          {t('publicAccess')}
        </CardTitle>
        <CardDescription>
          {isPublic ? t('publicAccessDescription') : t('privateAccessDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant={isPublic ? 'default' : 'secondary'}>
                {isPublic ? t('public') : t('private')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isPublic ? t('anyoneCanView') : t('onlySharedUsers')}
              </span>
            </div>
          </div>
          <Button
            variant={isPublic ? 'outline' : 'default'}
            onClick={handleTogglePublic}
            disabled={submitting}
          >
            {isPublic ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                {t('makePrivate')}
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                {t('makePublic')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

