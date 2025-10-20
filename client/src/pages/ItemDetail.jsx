import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { ArrowLeft, Edit, Trash2, Heart, Calendar, User } from 'lucide-react'

export default function ItemDetail() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { getTranslation, language } = useI18n()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/items/${id}`)
        setItem(response.data)
        setLiked(response.data.likes?.some(like => like.userId === user?.id) || false)
      } catch (error) {
        console.error('Error fetching item:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, user?.id])

  const handleToggleLike = async () => {
    try {
      await api.post(`/items/${id}/like`)
      setLiked(!liked)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getTranslation('loginRequired', language)}</h2>
          <Button asChild>
            <Link to="/login">{getTranslation('login', language)}</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{getTranslation('loading', language)}</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getTranslation('itemNotFound', language)}</h2>
          <Button asChild>
            <Link to="/dashboard">{getTranslation('backToDashboard', language)}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/inventory/${item.inventory.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {getTranslation('backToInventory', language)}
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{item.customId || item.id}</h1>
          <p className="text-muted-foreground">
            {getTranslation('fromInventory', language)}: {item.inventory.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={handleToggleLike}
          >
            <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
            {item.likes?.length || 0}
          </Button>
          {item.userId === user?.id && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                {getTranslation('edit', language)}
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {getTranslation('delete', language)}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Item Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Fields */}
          {item.inventory.fields?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation('itemDetails', language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.inventory.fields.map((field) => (
                    <div key={field.id}>
                      <label className="text-sm font-medium text-muted-foreground">
                        {field.title}
                      </label>
                      <p className="text-sm">
                        {item.fields[field.title] || getTranslation('notSet', language)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Likes */}
          {item.likes?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation('likes', language)} ({item.likes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.likes.map((like) => (
                    <Badge key={like.id} variant="outline">
                      {like.user.name || like.user.email}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Item Info */}
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('itemInfo', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">{getTranslation('createdBy', language)}:</span>
                <span className="ml-2">{item.user.name || item.user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">{getTranslation('createdAt', language)}:</span>
                <span className="ml-2">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('actions', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link to={`/inventory/${item.inventory.id}`}>
                  {getTranslation('viewInventory', language)}
                </Link>
              </Button>
              {item.userId === user?.id && (
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  {getTranslation('editItem', language)}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
