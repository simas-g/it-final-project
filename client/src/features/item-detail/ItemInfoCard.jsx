import { User, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useItemDetail } from './ItemDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const ItemInfoCard = () => {
  const { item } = useItemDetail()
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('itemInfo')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">{t('createdBy')}:</span>
          <span className="ml-2">{item.user.name || item.user.email}</span>
        </div>
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">{t('createdAt')}:</span>
          <span className="ml-2">{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default ItemInfoCard

