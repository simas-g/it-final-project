import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Calendar, Heart } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const ItemResultCard = ({ item }) => {
  const { getTranslation, language } = useI18n()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">
              <Link 
                to={`/item/${item.id}`}
                className="hover:text-primary transition-colors"
              >
                {item.customId || item.id}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              {getTranslation('fromInventory', language)}: {item.inventory.name}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {item.user.name || item.user.email}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              {item.likes?.length > 0 && (
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {item.likes.length} {getTranslation('likes', language)}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/item/${item.id}`}>
              {getTranslation('view', language)}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

