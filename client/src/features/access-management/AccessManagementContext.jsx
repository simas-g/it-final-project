import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { fetchInventoryAccessList, searchUsers as searchUsersApi } from '@/queries/api'

const AccessManagementContext = createContext(null)

export const useAccessManagement = () => {
  const context = useContext(AccessManagementContext)
  if (!context) {
    throw new Error('useAccessManagement must be used within AccessManagementProvider')
  }
  return context
}

export const AccessManagementProvider = ({ inventoryId, isOwner, children }) => {
  const { t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [accessToRemove, setAccessToRemove] = useState(null)
  const { data: accessData, isLoading: loading } = useQuery({
    queryKey: ['inventoryAccess', inventoryId],
    queryFn: () => fetchInventoryAccessList(inventoryId),
  })
  const { data: rawSearchResults = [], isLoading: searching } = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: () => searchUsersApi(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  })
  const accessList = accessData?.accessList || []
  const isPublic = accessData?.isPublic || false
  const searchResults = useMemo(() => {
    if (!rawSearchResults || rawSearchResults.length === 0) return []
    const existingUserIds = new Set(accessList.map(access => access.user.id))
    return rawSearchResults.filter(user => !existingUserIds.has(user.id))
  }, [rawSearchResults, accessList])
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      queryClient.setQueryData(['searchUsers', searchQuery], [])
    }
  }, [searchQuery, queryClient])
  const addAccessMutation = useMutation({
    mutationFn: (userId) => api.post(`/inventories/${inventoryId}/access`, {
      userId,
      accessType: 'WRITE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryAccess', inventoryId])
      setShowAddUser(false)
      setSearchQuery('')
      setSelectedUser(null)
      toast({
        title: t('success'),
        description: t('accessGranted')
      })
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.response?.data?.error || error.response?.data?.details || t('errorAddingAccess'),
        variant: 'destructive'
      })
    }
  })
  const removeAccessMutation = useMutation({
    mutationFn: (accessId) => api.delete(`/access/${accessId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryAccess', inventoryId])
      toast({
        title: t('success'),
        description: t('accessRemoved')
      })
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorRemovingAccess'),
        variant: 'destructive'
      })
    }
  })
  const togglePublicMutation = useMutation({
    mutationFn: () => api.put(`/inventories/${inventoryId}/public`, {
      isPublic: !isPublic
    }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['inventoryAccess', inventoryId])
      toast({
        title: t('success'),
        description: response.data.isPublic ? t('inventoryNowPublic') : t('inventoryNowPrivate')
      })
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorTogglingPublic'),
        variant: 'destructive'
      })
    }
  })
  const handleAddAccess = () => {
    if (!selectedUser) return
    addAccessMutation.mutate(selectedUser.id)
  }
  
  const handleRemoveAccess = (accessId) => {
    setAccessToRemove(accessId)
    setConfirmDialogOpen(true)
  }

  const confirmRemoveAccess = () => {
    if (accessToRemove) {
      removeAccessMutation.mutate(accessToRemove)
      setAccessToRemove(null)
    }
  }

  const handleTogglePublic = () => {
    togglePublicMutation.mutate()
  }

  const cancelAddUser = () => {
    setShowAddUser(false)
    setSearchQuery('')
    setSelectedUser(null)
  }

  const toggleSortBy = () => {
    setSortBy(prev => prev === 'name' ? 'email' : 'name')
  }

  const submitting = addAccessMutation.isPending || removeAccessMutation.isPending || togglePublicMutation.isPending

  const sortedAccessList = useMemo(() => {
    if (!accessList || accessList.length === 0) return []
    
    return [...accessList].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = (a.user.name || a.user.email).toLowerCase()
        const nameB = (b.user.name || b.user.email).toLowerCase()
        return nameA.localeCompare(nameB)
      } else {
        const emailA = a.user.email.toLowerCase()
        const emailB = b.user.email.toLowerCase()
        return emailA.localeCompare(emailB)
      }
    })
  }, [accessList, sortBy])

  const value = {
    loading,
    isOwner,
    isPublic,
    accessList: sortedAccessList,
    showAddUser,
    setShowAddUser,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    selectedUser,
    setSelectedUser,
    sortBy,
    submitting,
    handleAddAccess,
    handleRemoveAccess,
    handleTogglePublic,
    cancelAddUser,
    toggleSortBy,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmRemoveAccess,
  }

  return (
    <AccessManagementContext.Provider value={value}>
      {children}
    </AccessManagementContext.Provider>
  )
}

