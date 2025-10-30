import { useState, useEffect } from 'react'

import { useParams, Link } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

import { useI18n } from '@/contexts/I18nContext'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import Discussion from '@/components/Discussion'

import AccessManagement from '@/components/AccessManagement'

import api from '@/lib/api'

import { Package, Users, Settings, MessageSquare, BarChart3, Plus, Hash, Lock } from 'lucide-react'

export default function InventoryDetail() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { getTranslation, language } = useI18n()
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('items')
  const [statistics, setStatistics] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get(`/inventories/${id}`)
        setInventory(response.data)
      } catch (error) {
        console.error('Error fetching inventory:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [id])
  useEffect(() => {
    const fetchStatistics = async () => {
      if (activeTab === 'stats') {
        setStatsLoading(true)
        try {
          const response = await api.get(`/inventories/${id}/statistics`)
          console.log('Statistics response:', response.data)
          setStatistics(response.data)
        } catch (error) {
          console.error('Error fetching statistics:', error)
          console.error('Error details:', error.response?.data)
          setStatistics(null)
        } finally {
          setStatsLoading(false)
        }
      }
    }
    fetchStatistics()
  }, [id, activeTab])
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
  if (!inventory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getTranslation('inventoryNotFound', language)}</h2>
          <Button asChild>
            <Link to="/dashboard">{getTranslation('backToDashboard', language)}</Link>
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full space-y-6">
      <div className="pb-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{inventory.name}</h1>
              {inventory.isPublic && (
                <Badge variant="secondary">{getTranslation('public', language)}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {inventory.description || getTranslation('noDescription', language)}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link 
                to={`/profile/${inventory.user.id}`}
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4 mr-1" />
                {inventory.user.name || inventory.user.email}
              </Link>
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {inventory._count?.items || 0} {getTranslation('items', language)}
              </span>
            </div>
          </div>
          {isAuthenticated() && user && (user.id === inventory.userId || user.role === 'ADMIN') && (
            <Button asChild>
              <Link to={`/inventory/${id}/item/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {getTranslation('addItem', language)}
              </Link>
            </Button>
          )}
        </div>
      </div>
      {inventory.imageUrl && (
        <div className="w-full">
          <img
            src={inventory.imageUrl}
            alt={inventory.name}
            className="w-full max-h-64 object-cover rounded-lg border"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="items" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            {getTranslation('items', language)}
          </TabsTrigger>
          <TabsTrigger value="discussion" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            {getTranslation('discussion', language)}
          </TabsTrigger>
          {user && user.id === inventory.userId && (
            <TabsTrigger value="access" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              {getTranslation('access', language)}
            </TabsTrigger>
          )}
          {user && user.id === inventory.userId && (
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              {getTranslation('settings', language)}
            </TabsTrigger>
          )}
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            {getTranslation('statistics', language)}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('items', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.items?.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {getTranslation('noItems', language)}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {getTranslation('addFirstItem', language)}
                  </p>
                  {isAuthenticated() && user && (user.id === inventory.userId || user.role === 'ADMIN') && (
                    <Button asChild>
                      <Link to={`/inventory/${id}/item/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        {getTranslation('addItem', language)}
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b-2">
                        <tr className="text-left">
                          <th className="pb-3 px-4 font-semibold whitespace-nowrap">Custom ID</th>
                          {inventory.fields?.filter(f => f.showInTable).map(field => (
                            <th key={field.id} className="pb-3 px-4 font-semibold whitespace-nowrap">
                              {field.title}
                            </th>
                          ))}
                          <th className="pb-3 px-4 font-semibold whitespace-nowrap">Created By</th>
                          <th className="pb-3 px-4 font-semibold whitespace-nowrap">Created At</th>
                          <th className="pb-3 px-4 font-semibold text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.items?.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono font-medium">{item.customId || item.id.substring(0, 8)}</span>
                            </td>
                            {inventory.fields?.filter(f => f.showInTable).map(field => (
                              <td key={field.id} className="py-3 px-4">
                                {field.fieldType === 'BOOLEAN' ? (
                                  <Badge variant={item.fields?.[field.id] ? "default" : "outline"}>
                                    {item.fields?.[field.id] === true ? 'Yes' :  item.fields?.[field.id] === false ? 'No' : '-'}
                                  </Badge>
                                ) : field.fieldType === 'MULTI_LINE_TEXT' ? (
                                  <span className="text-sm line-clamp-2">{item.fields?.[field.id] || '-'}</span>
                                ) : field.fieldType === 'IMAGE_URL' && item.fields?.[field.id] ? (
                                  <div className="flex items-center space-x-2">
                                    <img 
                                      src={item.fields[field.id]} 
                                      alt={field.title}
                                      className="w-8 h-8 rounded object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'inline';
                                      }}
                                    />
                                    <span className="text-xs text-muted-foreground hidden truncate max-w-20">
                                      {item.fields[field.id]}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm">{item.fields?.[field.id] || '-'}</span>
                                )}
                              </td>
                            ))}
                            <td className="py-3 px-4 text-sm">
                              <Link 
                                to={`/profile/${item.user.id}`}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                {item.user.name || item.user.email}
                              </Link>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/item/${item.id}`}>
                                  {getTranslation('view', language)}
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-3">
                    {inventory.items?.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className=" font-medium text-sm">
                                <span className="text-muted-foreground font-medium">Custom ID: </span>
                                <p className='font-mono'>{item.customId || item.id.substring(0, 8)}</p>
                              </div>
                              {inventory.fields?.filter(f => f.showInTable).map(field => (
                                <div key={field.id} className="text-sm">
                                  <span className="text-muted-foreground font-medium">{field.title}: </span>
                                  {field.fieldType === 'BOOLEAN' ? (
                                    <Badge variant={item.fields?.[field.id] ? "default" : "outline"} className="text-xs">
                                      {item.fields?.[field.id] === true ? 'Yes' :  item.fields?.[field.id] === false ? 'No' : '-'}
                                    </Badge>
                                  ) : (
                                    <span className="line-clamp-1">{item.fields?.[field.id] || '-'}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <Button variant="outline" size="sm" asChild className="ml-2 shrink-0">
                              <Link to={`/item/${item.id}`}>
                                {getTranslation('view', language)}
                              </Link>
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <Link 
                              to={`/profile/${item.user.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {item.user.name || item.user.email.split('@')[0]}
                            </Link>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion" className="space-y-4">
          <Discussion inventoryId={id} />
        </TabsContent>
        <TabsContent value="access" className="space-y-4">
          <AccessManagement 
            inventoryId={id} 
            isOwner={user && user.id === inventory.userId}
          />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('settings', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between p-4 border-2 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Hash className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Custom ID Format</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure how item IDs are generated for this inventory. Define custom patterns using fixed text, random numbers, dates, and sequences.
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link to={`/inventory/${id}/custom-id`}>
                    Configure
                  </Link>
                </Button>
              </div>
              <div className="flex items-start justify-between p-4 border-2 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Custom Fields</h3>
                    <p className="text-sm text-muted-foreground">
                      Define custom fields for your items (up to 3 of each type: text, number, URL, checkbox).
                    </p>
                    {inventory?.fields?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {inventory.fields.length} field{inventory.fields.length !== 1 ? 's' : ''} configured
                      </p>
                    )}
                  </div>
                </div>
                <Button asChild>
                  <Link to={`/inventory/${id}/fields`}>
                    Configure
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="space-y-4">
          {statsLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : statistics?.overview?.totalItems > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation('overviewStats', language)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{getTranslation('totalItems', language)}</p>
                      <p className="text-2xl font-bold">{statistics.overview.totalItems}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{getTranslation('itemsLast7Days', language)}</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.overview.itemsLast7Days}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{getTranslation('itemsLast30Days', language)}</p>
                      <p className="text-2xl font-bold text-green-600">{statistics.overview.itemsLast30Days}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{getTranslation('averageItemsPerDay', language)}</p>
                      <p className="text-2xl font-bold text-purple-600">{statistics.overview.averageItemsPerDay}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{getTranslation('likes', language)}</p>
                      <p className="text-2xl font-bold text-red-600">{statistics.overview.totalLikes}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{getTranslation('totalDiscussions', language)}</p>
                      <p className="text-2xl font-bold text-orange-600">{statistics.overview.totalDiscussions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{getTranslation('topContributors', language)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getTranslation('contributorsDescription', language)}</p>
                  </CardHeader>
                  <CardContent>
                    {statistics.topContributors.length > 0 ? (
                      <div className="space-y-3">
                        {statistics.topContributors.map((contributor, index) => (
                          <div key={contributor.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                {index + 1}
                              </div>
                              <Link
                                to={`/profile/${contributor.user.id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {contributor.user.name || contributor.user.email}
                              </Link>
                            </div>
                            <Badge variant="secondary">{contributor.itemCount} {getTranslation('items', language)}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">{getTranslation('noItems', language)}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{getTranslation('recentItems', language)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getTranslation('recentItemsDescription', language)}</p>
                  </CardHeader>
                  <CardContent>
                    {statistics.recentItems.length > 0 ? (
                      <div className="space-y-3">
                        {statistics.recentItems.map((item) => (
                          <Link
                            key={item.id}
                            to={`/item/${item.id}`}
                            className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="font-mono font-medium text-sm">{item.customId || item.id.substring(0, 8)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.user.name || item.user.email}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">{getTranslation('noItems', language)}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation('activityOverTime', language)}</CardTitle>
                  <p className="text-sm text-muted-foreground">{getTranslation('activityDescription', language)}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-end justify-between space-x-1 h-48">
                      {statistics.itemsOverTime.map((day, index) => {
                        const maxCount = Math.max(...statistics.itemsOverTime.map(d => d.count), 1)
                        const heightPercent = (day.count / maxCount) * 100
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center justify-end group">
                            <div className="relative w-full">
                              <div
                                className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                                style={{ height: `${Math.max(heightPercent, day.count > 0 ? 5 : 0)}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                                title={`${day.date}: ${day.count} ${getTranslation('items', language)}`}
                              ></div>
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {new Date(day.date).getDate()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="text-center text-xs text-muted-foreground pt-2">
                      {getTranslation('itemsAdded', language)} ({statistics.itemsOverTime[0]?.date} - {statistics.itemsOverTime[statistics.itemsOverTime.length - 1]?.date})
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation('statistics', language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {getTranslation('noStatsData', language)}
                  </h3>
                  <p className="text-muted-foreground">
                    {getTranslation('noStatsDescription', language)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
