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

import { hasWriteAccess, isOwner, isAdminOrCreator } from '@/lib/permissions'

import { Package, Users, Settings, MessageSquare, BarChart3, Plus, Hash, Lock } from 'lucide-react'
import Statistics from '@/components/inventory/Statistics'

export default function InventoryDetail() {
  const { id } = useParams()
  const { user } = useAuth()
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
        console.log('Inventory fetched:', response.data)
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
        <div className="flex flex-row items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col sm:flex-row items-start gap-4 flex-wrap flex-1 min-w-0">
            {inventory.imageUrl && (
            <div className="">
              <img
                src={inventory.imageUrl}
                alt={inventory.name}
                className="w-48 h-48 object-cover rounded-lg border"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            )}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{inventory.name}</h1>
                {inventory.isPublic && (
                  <Badge variant="secondary">{getTranslation('public', language)}</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {inventory.description || getTranslation('noDescription', language)}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
          </div>
          
          {hasWriteAccess(inventory, user) && (
            <Button asChild className="flex-shrink-0">
              <Link to={`/inventory/${id}/item/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {getTranslation('addItem', language)}
              </Link>
            </Button>
          )}
        </div>
      </div>
      
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
          {(isOwner(inventory, user) || isAdminOrCreator(user)) && (
            <TabsTrigger value="access" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              {getTranslation('access', language)}
            </TabsTrigger>
          )}
          {(isOwner(inventory, user) || isAdminOrCreator(user)) && (
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
                  {hasWriteAccess(inventory, user) && (
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
            isOwner={isOwner(inventory, user) || isAdminOrCreator(user)}
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
          <Statistics statistics={statistics} statsLoading={statsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
