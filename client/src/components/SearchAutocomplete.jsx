import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Package, Tag, User } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/command'
import { fetchSearchSuggestions } from '@/queries/api'
import { useI18n } from '@/contexts/I18nContext'

const SearchAutocomplete = ({ className = '' }) => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery)
      setIsTyping(false)
    }
  }, [searchParams])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 600)

    return () => clearTimeout(timer)
  }, [query])

  const { data: suggestions = [], isLoading: loading } = useQuery({
    queryKey: ['searchSuggestions', debouncedQuery],
    queryFn: () => fetchSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && isTyping,
  })

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      setQuery(searchQuery.trim())
      setIsTyping(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionSelect = (suggestion) => {
    handleSearch(suggestion.text)
  }

  const getIcon = (type) => {
    switch (type) {
      case 'inventory':
        return <Package className="h-4 w-4 text-blue-500" />
      case 'tag':
        return <Tag className="h-4 w-4 text-green-500" />
      case 'user':
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'inventory':
        return t('inventory')
      case 'tag':
        return t('tag')
      case 'user':
        return t('user')
      default:
        return ''
    }
  }

  return (
    <Command className={className} shouldFilter={false}>
      <CommandInput
        placeholder={t('searchPlaceholder')}
        value={query}
        onValueChange={(value) => {
          setQuery(value)
          setIsTyping(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && suggestions.length === 0) {
            e.preventDefault()
            handleSearch()
          }
        }}
      />
      <CommandList>
        {loading && isTyping && <CommandLoading>{t('loading')}...</CommandLoading>}
        {!loading && isTyping && query.length >= 2 && suggestions.length === 0 && (
          <CommandEmpty className="border-b p-4 border-r border-l rounded-b-md text-center text-muted-foreground text-sm">{t('noSuggestions')}</CommandEmpty>
        )}
        {!loading && isTyping && suggestions.length > 0 && (
          <>
            <CommandGroup heading={t('suggestions')} className="border-r border-b rounded-b-md border-l">
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  onSelect={() => handleSuggestionSelect(suggestion)}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <div className="flex-shrink-0">{getIcon(suggestion.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.text}</div>
                    <div className="text-xs text-muted-foreground">
                      {getTypeLabel(suggestion.type)}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  )
}

export default SearchAutocomplete

