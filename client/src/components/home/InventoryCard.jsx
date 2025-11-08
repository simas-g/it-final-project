import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Users, Calendar } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

const InventoryCard = ({ inventory }) => {
  const { t } = useI18n()
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold mb-1 truncate">
              <Link 
                to={`/inventory/${inventory.id}`}
                className="hover:underline underline-offset-4"
              >
                {inventory.name}
              </Link>
            </CardTitle>
            {inventory.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {inventory.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {inventory.isPublic ? (
              <Badge variant="secondary" className="text-xs">
                {t('public')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                {t('private')}
              </Badge>
            )}
            {inventory.category && (
              <Badge variant="default" className="text-xs">
                {inventory.category.name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 flex-grow flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <Package className="h-3.5 w-3.5" />
            <span>{inventory._count.items} {t('items')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(inventory.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground border-t pt-3">
          <Users className="h-3.5 w-3.5 mr-1" />
          <span className="truncate">{inventory.user.name || inventory.user.email}</span>
        </div>
        {inventory.inventoryTags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t mt-3">
            {inventory.inventoryTags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className="text-xs"
              >
                {tag.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InventoryCard

