import { createContext, useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { usePagination } from '@/hooks/usePagination'
import { useInventoryExport } from '@/hooks/useInventoryExport'
import { hasWriteAccess, isOwner, isAdmin } from '@/lib/permissions'
import { fetchInventory, fetchInventoryItems, fetchInventoryStatistics } from '@/queries/api'

const InventoryDetailContext = createContext()

export const InventoryDetailProvider = ({ children, inventoryId }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('items')
  const { page: itemsPage, limit: itemsLimit, goToPage: goToItemsPage } = usePagination(1, 20)
  const { handleExport, exporting } = useInventoryExport(inventoryId)
  const { data: inventory, isLoading: loading } = useQuery({
    queryKey: ['inventory', inventoryId],
    queryFn: () => fetchInventory(inventoryId),
  })
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['inventoryItems', inventoryId, itemsPage, itemsLimit],
    queryFn: () => fetchInventoryItems({ inventoryId, page: itemsPage, limit: itemsLimit }),
    enabled: !!inventory && activeTab === 'items',
  })
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['inventoryStatistics', inventoryId],
    queryFn: () => fetchInventoryStatistics(inventoryId),
    enabled: activeTab === 'stats',
  })
  const items = itemsData?.items || []
  const itemsPagination = itemsData?.pagination || null
  const value = {
    inventoryId,
    inventory,
    loading,
    items,
    itemsLoading,
    itemsPagination,
    statistics,
    statsLoading,
    activeTab,
    setActiveTab,
    goToItemsPage,
    handleExport,
    exporting,
    hasWriteAccess: hasWriteAccess(inventory, user),
    isOwner: isOwner(inventory, user),
    isAdmin: isAdmin(user),
  }
  return (
    <InventoryDetailContext.Provider value={value}>
      {children}
    </InventoryDetailContext.Provider>
  )
}

export const useInventoryDetail = () => {
  const context = useContext(InventoryDetailContext)
  if (!context) {
    throw new Error('useInventoryDetail must be used within an InventoryDetailProvider')
  }
  return context
}

