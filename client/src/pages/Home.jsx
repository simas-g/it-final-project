import { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

import { useTheme } from '@/contexts/ThemeContext'

import { useI18n } from '@/contexts/I18nContext'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'

import { api } from '@/lib/api'
import { 
  Package, 
  Users, 
  TrendingUp, 
  Calendar,
  Tag,
  ArrowRight,
  Search,
  Shield,
  Zap
} from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { language } = useTheme()
  const { t } = useI18n()
  const [latestInventories, setLatestInventories] = useState([])
  const [popularInventories, setPopularInventories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoriesRes, popularRes, tagsRes] = await Promise.all([
          api.get('/inventories?limit=3'),
          api.get('/inventories/popular'),
          api.get('/tags')
        ])
        setLatestInventories(inventoriesRes.data.inventories)
        setPopularInventories(popularRes.data.slice(0, 3))
        setTags(tagsRes.data.slice(0, 30))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }
  return (
    <div className={`max-w-6xl mx-auto space-y-8 sm:space-y-12 px-4 ${isAuthenticated() ? 'py-6' : 'py-8 md:p-10'}`}>
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {t('latestCollections')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('recentlyCreated')}
            </p>
          </div>
          <Button variant="ghost" asChild className="self-start sm:self-auto">
            <Link to="/search">
              {t('viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {latestInventories.map((inventory) => (
            <Card key={inventory.id} className="hover:shadow-md transition-shadow flex flex-col">
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
                  {inventory.isPublic && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {t('public')}
                    </Badge>
                  )}
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
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
          <h2 className="text-xl sm:text-2xl font-bold">
            {t('trending')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('mostPopular')}
          </p>
        </div>
        <div className="space-y-3 grid grid-cols-1 gap-4">
          {popularInventories.slice(0, 5).map((inventory, idx) => (
            <Card key={inventory.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-xl sm:text-2xl font-bold text-muted-foreground w-6 sm:w-8 text-center pt-1 sm:pt-0">
                    {idx + 1}
                  </div>
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
          ))}
        </div>
      </section>
      {tags.length > 0 && (
        <section>
          <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
            <h2 className="text-xl sm:text-2xl font-bold">
              {t('browseByTags')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('exploreCategories')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="px-2 sm:px-3 py-1 cursor-pointer hover:bg-foreground hover:text-background transition-colors max-w-full"
              >
                <Link to={`/search?tag=${encodeURIComponent(tag.name)}`} className="flex items-center min-w-0">
                  <Tag className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate">{tag.name}</span>
                  <span className="ml-1.5 text-xs opacity-60 shrink-0">
                    {tag._count?.inventories || 0}
                  </span>
                </Link>
              </Badge>
            ))}
          </div>
        </section>
      )}
      {!isAuthenticated() && (
        <section className="text-center space-y-6 py-12 sm:py-16 border-t">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {t('startManagingToday')}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto px-4">
              {t('joinPlatform')}
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/register">
              {t('createFreeAccount')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      )}
    </div>
  )
}