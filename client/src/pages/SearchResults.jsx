import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { Search, Package, FileText, User, Calendar, Heart } from 'lucide-react'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { getTranslation, language } = useI18n()
  const [results, setResults] = useState({ inventories: [], items: [] })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [searchType, setSearchType] = useState(null) // 'query' or 'tag'
  const [currentTag, setCurrentTag] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const query = searchParams.get('q')
    const tag = searchParams.get('tag')
    
    if (tag) {
      setCurrentTag(tag)
      setSearchType('tag')
      setSearchQuery('')
      setHasSearched(true)
      performTagSearch(tag)
    } else if (query && query.trim()) {
      setSearchQuery(query)
      setSearchType('query')
      setCurrentTag(null)
      setHasSearched(true)
      performSearch(query)
    } else {
      // No query provided, stay in search prompt mode
      setSearchType(null)
      setCurrentTag(null)
      setHasSearched(false)
      setResults({ inventories: [], items: [] })
    }
  }, [searchParams, activeTab])

  const performSearch = async (query) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`)
      setResults(response.data.results)
    } catch (error) {
      console.error('Error performing search:', error)
    } finally {
      setLoading(false)
    }
  }

  const performTagSearch = async (tag) => {
    if (!tag.trim()) return

    setLoading(true)
    try {
      const response = await api.get(`/search/tag/${encodeURIComponent(tag)}`)
      setResults({ inventories: response.data.inventories, items: [] })
    } catch (error) {
      console.error('Error performing tag search:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{getTranslation('searching', language)}</p>
        </div>
      </div>
    )
  }

  // Show search prompt if no search has been performed
  if (!hasSearched) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 mt-8 px-10">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={getTranslation('searchPlaceholder', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={!searchQuery.trim()}>
            {getTranslation('search', language)}
          </Button>
        </form>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{getTranslation('searchInventoriesItems', language)}</h2>
            <p className="text-muted-foreground">
              {getTranslation('enterSearchTerm', language)}
            </p>
          </div>
        </div>
      </div>
    )
  }

    return (
      <div className="space-y-6 mt-8 px-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{getTranslation('searchResults', language)}</h1>
        
        {currentTag && (
          <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg border-2">
            <span className="text-sm text-muted-foreground">{getTranslation('searchingByTag', language)}</span>
            <Badge variant="default" className="text-sm">
              {currentTag}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="ml-auto"
            >
              <Link to="/search">{getTranslation('clearFilter', language)}</Link>
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={getTranslation('searchPlaceholder', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">
            {getTranslation('search', language)}
          </Button>
        </form>
      </div>

      {currentTag ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {getTranslation('inventories', language)} ({results.inventories?.length || 0})
          </h2>
          {results.inventories?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.inventories.map((inventory) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {getTranslation('noInventoriesFound', language)}
              </h3>
              <p className="text-muted-foreground">
                {getTranslation('noInventoriesWithTag', language)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">{getTranslation('all', language)}</TabsTrigger>
            <TabsTrigger value="inventories">{getTranslation('inventories', language)}</TabsTrigger>
            <TabsTrigger value="items">{getTranslation('items', language)}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
          {results.inventories?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                {getTranslation('inventories', language)} ({results.inventories.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.inventories.map((inventory) => (
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
                ))}
              </div>
            </div>
          )}

          {results.items?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                {getTranslation('items', language)} ({results.items.length})
              </h2>
              <div className="space-y-2">
                {results.items.map((item) => (
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
                ))}
              </div>
            </div>
          )}

          {(!results.inventories?.length && !results.items?.length) && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {getTranslation('noResults', language)}
              </h3>
              <p className="text-muted-foreground">
                {getTranslation('tryDifferentSearch', language)}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventories" className="space-y-4">
          {results.inventories?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.inventories.map((inventory) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {getTranslation('noInventoriesFound', language)}
              </h3>
              <p className="text-muted-foreground">
                {getTranslation('tryDifferentSearch', language)}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          {results.items?.length > 0 ? (
            <div className="space-y-2">
              {results.items.map((item) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {getTranslation('noItemsFound', language)}
              </h3>
              <p className="text-muted-foreground">
                {getTranslation('tryDifferentSearch', language)}
              </p>
            </div>
          )}
        </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
