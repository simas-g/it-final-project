import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Package, Calendar } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const InventoryResultCard = ({ inventory }) => {
  const { getTranslation, language } = useI18n()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg">
              <Link 
                to={`/inventory/${inventory.id}`}
                className="hover:text-primary transition-colors"
              >
                {inventory.name}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {inventory.description || getTranslation('noDescription', language)}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {inventory.isPublic ? (
              <Badge variant="secondary" className="text-xs">
                {getTranslation('public', language)}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                {getTranslation('private', language)}
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
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {inventory.user.name || inventory.user.email}
            </div>
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-1" />
              {inventory._count?.items || 0} {getTranslation('items', language)}
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(inventory.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

