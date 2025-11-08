import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Users } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
const TrendingItem = ({ inventory, rank }) => {
  const { t } = useI18n()
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-4">
          <div className="text-xl sm:text-2xl font-bold text-muted-foreground w-6 sm:w-8 text-center pt-1 sm:pt-0">
            {rank}
          </div>
          {inventory.imageUrl && (
            <img src={inventory.imageUrl} alt={inventory.name} className="w-24 h-24 object-cover" />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <Link 
              to={`/inventory/${inventory.id}`}
              className="text-sm sm:text-base font-semibold hover:underline underline-offset-4 block truncate"
            >
              {inventory.name}
            </Link>
            {inventory.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 sm:truncate">
                {inventory.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
              <span className="flex items-center shrink-0">
                <Package className="h-3 w-3 mr-1" />
                {inventory._count.items} {t('items')}
              </span>
              <span className="flex items-center min-w-0">
                <Users className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">{inventory.user.name || inventory.user.email}</span>
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 text-xs sm:text-sm">
            <Link to={`/inventory/${inventory.id}`}>
              {t('view')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrendingItem

