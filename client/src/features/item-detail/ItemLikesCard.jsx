import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useItemDetail } from './ItemDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const ItemLikesCard = () => {
  const { item } = useItemDetail()
  const { t } = useI18n()
  const likes = item.likes

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          {t('likes')} ({likes?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {likes && likes.length > 0 ? (
          <div className="space-y-2">
            {likes.filter(like => like?.user && (like.user.name || like.user.email)).map((like) => (
              <div key={like.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <Link to={`/profile/${like.user.id}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                    <span className="text-primary font-semibold">
                      {((like.user.name || like.user.email || '?').charAt(0).toUpperCase())}
                    </span>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/profile/${like.user.id}`}
                    className="font-medium hover:text-primary transition-colors block truncate"
                  >
                    {like.user.name || like.user.email || 'Unknown'}
                  </Link>
                  {like.user.name && like.user.email && (
                    <p className="text-xs text-muted-foreground truncate">{like.user.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('noLikesYet')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ItemLikesCard

