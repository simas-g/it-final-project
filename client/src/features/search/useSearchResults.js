import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSearchResults, fetchTagSearchResults, fetchSearchSuggestions } from '@/queries/api'
import { usePagination } from './usePagination'

export const useSearchResults = () => {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('all')
  const { page, limit, goToPage, reset } = usePagination(1, 20)
  
  const query = searchParams.get('q')
  const tag = searchParams.get('tag')
  const searchType = tag ? 'tag' : query ? 'query' : null
  const hasSearched = !!searchType

  useEffect(() => {
    reset()
  }, [searchParams, reset])

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', query, activeTab, page, limit],
    queryFn: () => fetchSearchResults({ query, type: activeTab, page, limit }),
    enabled: searchType === 'query' && !!query,
  })

  const { data: tagSearchData, isLoading: tagSearchLoading } = useQuery({
    queryKey: ['tagSearch', tag, page, limit],
    queryFn: () => fetchTagSearchResults({ tag, page, limit }),
    enabled: searchType === 'tag' && !!tag,
  })

  const { data: suggestions = [] } = useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: () => fetchSearchSuggestions(query),
    enabled: searchType === 'query' && !!query,
  })

  const matchingTags = suggestions.filter(s => s.type === 'tag')
  const results = searchType === 'tag' 
    ? { inventories: tagSearchData?.inventories || [], items: [] }
    : searchData?.results || { inventories: [], items: [] }
  const pagination = searchType === 'tag' ? tagSearchData?.pagination : searchData?.pagination
  const loading = searchLoading || tagSearchLoading

  return {
    hasSearched,
    loading,
    query,
    tag,
    searchType,
    activeTab,
    setActiveTab,
    results,
    pagination,
    matchingTags,
    goToPage
  }
}

