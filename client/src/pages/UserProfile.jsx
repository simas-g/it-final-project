import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { User, Package, FileText, MessageSquare, Heart, Calendar, Mail, Clock } from 'lucide-react'

export default function UserProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const { getTranslation, language } = useI18n()
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inventories')

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(`/users/${id}`)
        setProfileUser(response.data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [id])

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

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getTranslation('userNotFound', language)}</h2>
          <Button asChild>
            <Link to="/dashboard">{getTranslation('backToDashboard', language)}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start gap-6 pb-6 border-b">
        <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center shrink-0">
          <User className="h-8 w-8 text-background" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{profileUser.name || profileUser.email}</h1>
            <Badge variant={profileUser.role === 'ADMIN' ? 'default' : profileUser.role === 'CREATOR' ? 'secondary' : 'outline'}>
              {profileUser.role}
            </Badge>
            {profileUser.isBlocked && (
              <Badge variant="destructive">{getTranslation('blocked', language)}</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {getTranslation('joined', language)} {new Date(profileUser.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span>
              <strong className="font-semibold">{profileUser._count?.inventories || 0}</strong> {getTranslation('inventories', language)}
            </span>
            <span>
              <strong className="font-semibold">{profileUser._count?.items || 0}</strong> {getTranslation('items', language)}
            </span>
            <span>
              <strong className="font-semibold">{profileUser._count?.discussionPosts || 0}</strong> {getTranslation('posts', language)}
            </span>
            <span>
              <strong className="font-semibold">{profileUser._count?.itemLikes || 0}</strong> {getTranslation('likes', language)}
            </span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventories" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            {getTranslation('inventories', language)} ({profileUser._count?.inventories || 0})
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {getTranslation('items', language)} ({profileUser._count?.items || 0})
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            {getTranslation('posts', language)} ({profileUser._count?.discussionPosts || 0})
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            {getTranslation('likes', language)} ({profileUser._count?.itemLikes || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {getTranslation('inventories', language)} ({profileUser.inventories?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileUser.inventories?.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {getTranslation('noInventories', language)}
                  </h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? getTranslation('createFirstInventory', language)
                      : getTranslation('userHasNoInventories', language)
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileUser.inventories.map((inventory) => (
                    <Card key={inventory.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
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
                          {inventory.isPublic && (
                            <Badge variant="secondary">
                              {getTranslation('public', language)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            {inventory._count?.items || 0} {getTranslation('items', language)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(inventory.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {getTranslation('items', language)} ({profileUser.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileUser.items?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {getTranslation('noItems', language)}
                  </h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? getTranslation('addFirstItem', language)
                      : getTranslation('userHasNoItems', language)
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {profileUser.items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
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
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              {item._count?.likes > 0 && (
                                <span className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {item._count.likes} {getTranslation('likes', language)}
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {getTranslation('posts', language)} ({profileUser.discussionPosts?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileUser.discussionPosts?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {getTranslation('noPosts', language)}
                  </h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? getTranslation('startDiscussion', language)
                      : getTranslation('userHasNoPosts', language)
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileUser.discussionPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                              <Link 
                                to={`/inventory/${post.inventory.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {post.inventory.name}
                              </Link>
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {post.content.length > 200 
                              ? `${post.content.substring(0, 200)}...` 
                              : post.content
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="likes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {getTranslation('likedItems', language)} ({profileUser.itemLikes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileUser.itemLikes?.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {getTranslation('noLikes', language)}
                  </h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? getTranslation('startLikingItems', language)
                      : getTranslation('userHasNoLikes', language)
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {profileUser.itemLikes.map((like) => (
                    <Card key={like.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              <Link 
                                to={`/item/${like.item.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {like.item.customId || like.item.id}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getTranslation('fromInventory', language)}: {like.item.inventory.name}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Heart className="h-4 w-4 mr-1 fill-current" />
                              {getTranslation('liked', language)}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/item/${like.item.id}`}>
                              {getTranslation('view', language)}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
