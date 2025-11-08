import { Link } from 'react-router-dom'
import { Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useItemDetail } from './ItemDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const ItemActionsCard = () => {
  const { item, isAuthenticated, hasWriteAccess, isEditing, startEditing } = useItemDetail()
  const { t } = useI18n()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('actions')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex flex-col gap-2 items-left justify-start">
        <Button variant="secondary" asChild>
          <Link to={`/inventory/${item.inventory.id}`}>
            {t('viewInventory')}
          </Link>
        </Button>
        {isAuthenticated && hasWriteAccess && !isEditing && (
          <Button className="w-full" variant="outline" onClick={startEditing}>
            <Edit className="h-4 w-4 mr-2" />
            {t('editItem')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default ItemActionsCard

