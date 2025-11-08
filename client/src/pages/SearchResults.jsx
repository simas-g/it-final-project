import SearchAutocomplete from '@/components/SearchAutocomplete'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import {
  useSearchResults,
  SearchHeader,
  InventoryResultCard,
  ItemResultCard,
  SearchEmptyState
} from '@/features/search'
import { Search } from 'lucide-react'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useI18n } from '@/contexts/I18nContext'

const SearchResults = () => {
  const { getTranslation, language } = useI18n()
  const {
    hasSearched,
    loading,
    tag,
    activeTab,
    setActiveTab,
    results,
    pagination,
    matchingTags,
    goToPage
  } = useSearchResults()
  if (loading) return <LoadingSpinner message={getTranslation('searching', language)} />
  if (!hasSearched) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 mt-8 px-10">
        <div className="flex items-center justify-center">
          <SearchAutocomplete className="flex-1 max-w-2xl" />
        </div>
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
      <SearchHeader tag={tag} matchingTags={matchingTags} />
      {tag ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {getTranslation('inventories', language)} ({results.inventories?.length || 0})
          </h2>
          {results.inventories?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.inventories.map((inventory) => (
                <InventoryResultCard key={inventory.id} inventory={inventory} />
              ))}
            </div>
          ) : (
            <SearchEmptyState type="tag" />
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
                  <InventoryResultCard key={inventory.id} inventory={inventory} />
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
                  <ItemResultCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
          {(!results.inventories?.length && !results.items?.length) && (
            <SearchEmptyState type="general" />
          )}
          {pagination && pagination.pages > 1 && (
            <Pagination pagination={pagination} onPageChange={goToPage} className="mt-6" />
          )}
        </TabsContent>
        <TabsContent value="inventories" className="space-y-4">
          {results.inventories?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.inventories.map((inventory) => (
                <InventoryResultCard key={inventory.id} inventory={inventory} />
              ))}
            </div>
          ) : (
            <SearchEmptyState type="inventories" />
          )}
          {pagination && pagination.pages > 1 && (
            <Pagination pagination={pagination} onPageChange={goToPage} className="mt-6" />
          )}
        </TabsContent>
        <TabsContent value="items" className="space-y-4">
          {results.items?.length > 0 ? (
            <div className="space-y-2">
              {results.items.map((item) => (
                <ItemResultCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <SearchEmptyState type="items" />
          )}
          {pagination && pagination.pages > 1 && (
            <Pagination pagination={pagination} onPageChange={goToPage} className="mt-6" />
          )}
        </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
export default SearchResults
