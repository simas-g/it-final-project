import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export const useAdminPanel = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const toggleBlockMutation = useMutation({
    mutationFn: ({ userId, isBlocked }) => api.put(`/admin/users/${userId}/block`, { isBlocked: !isBlocked }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers'])
    }
  })

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => api.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers'])
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers'])
    }
  })

  const handleToggleBlock = (userId, isBlocked) => {
    toggleBlockMutation.mutate({ userId, isBlocked })
  }

  const handleChangeRole = (userId, newRole) => {
    changeRoleMutation.mutate({ userId, role: newRole })
  }

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId)
    setConfirmDialogOpen(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete)
      setUserToDelete(null)
    }
  }

  const handleSearch = (goToPage) => {
    setSearchTerm(searchQuery)
    goToPage(1)
  }

  const handleKeyDown = (e, goToPage) => {
    if (e.key === 'Enter') {
      handleSearch(goToPage)
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    searchTerm,
    confirmDialogOpen,
    setConfirmDialogOpen,
    handleToggleBlock,
    handleChangeRole,
    handleDeleteUser,
    confirmDeleteUser,
    handleSearch,
    handleKeyDown
  }
}

