import { createContext, useContext, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { fetchDiscussionPosts } from '@/queries/api'

const DiscussionContext = createContext(null)

export const useDiscussion = () => {
  const context = useContext(DiscussionContext)
  if (!context) {
    throw new Error('useDiscussion must be used within DiscussionProvider')
  }
  return context
}

export const DiscussionProvider = ({ inventoryId, children }) => {
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [newPostContent, setNewPostContent] = useState('')
  const [editingPostId, setEditingPostId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)
  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['discussionPosts', inventoryId],
    queryFn: () => fetchDiscussionPosts(inventoryId),
  })
  const createPostMutation = useMutation({
    mutationFn: (content) => api.post(`/inventories/${inventoryId}/discussion`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussionPosts', inventoryId])
      setNewPostContent('')
      toast({
        title: t('success'),
        description: t('postCreated')
      })
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorCreatingPost'),
        variant: 'destructive'
      })
    }
  })
  const updatePostMutation = useMutation({
    mutationFn: ({ postId, content }) => api.put(`/discussion/${postId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussionPosts', inventoryId])
      setEditingPostId(null)
      setEditContent('')
      toast({
        title: t('success'),
        description: t('postUpdated')
      })
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorUpdatingPost'),
        variant: 'destructive'
      })
    }
  })
  const deletePostMutation = useMutation({
    mutationFn: (postId) => api.delete(`/discussion/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussionPosts', inventoryId])
      toast({
        title: t('success'),
        description: t('postDeleted')
      })
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorDeletingPost'),
        variant: 'destructive'
      })
    }
  })
  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!newPostContent.trim()) return
    createPostMutation.mutate(newPostContent.trim())
  }

  const handleEditPost = (postId) => {
    if (!editContent.trim()) return
    updatePostMutation.mutate({ postId, content: editContent.trim() })
  }

  const handleDeletePost = (postId) => {
    setPostToDelete(postId)
    setConfirmDialogOpen(true)
  }

  const confirmDeletePost = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete)
      setPostToDelete(null)
    }
  }

  const startEditing = (post) => {
    setEditingPostId(post.id)
    setEditContent(post.content)
  }

  const cancelEditing = () => {
    setEditingPostId(null)
    setEditContent('')
  }

  const submitting = createPostMutation.isPending || updatePostMutation.isPending || deletePostMutation.isPending

  const authenticated = isAuthenticated()

  const value = {
    user,
    currentUserId: user?.id,
    isAuthenticated: authenticated,
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    editingPostId,
    editContent,
    setEditContent,
    submitting,
    handleCreatePost,
    handleEditPost,
    handleDeletePost,
    startEditing,
    cancelEditing,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmDeletePost,
    t,
  }

  return (
    <DiscussionContext.Provider value={value}>
      {children}
    </DiscussionContext.Provider>
  )
}

