import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { formatDate } from '@/lib/formatting'
import { MessageSquare, Send, Edit2, Trash2, X, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Discussion({ inventoryId }) {
  const { user, isAuthenticated } = useAuth()
  const { t, language } = useI18n()
  const { toast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [editingPostId, setEditingPostId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    fetchPosts()
  }, [inventoryId])
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/inventories/${inventoryId}/discussion`)
      setPosts(response.data.posts || [])
    } catch (error) {
      console.error('Error fetching discussion posts:', error)
      toast({
        title: t('error'),
        description: t('errorFetchingPosts'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPostContent.trim()) return
    try {
      setSubmitting(true)
      const response = await api.post(`/inventories/${inventoryId}/discussion`, {
        content: newPostContent.trim()
      })
      setPosts([...posts, response.data])
      setNewPostContent('')
      toast({
        title: t('success'),
        description: t('postCreated')
      })
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorCreatingPost'),
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return

    try {
      setSubmitting(true)
      const response = await api.put(`/discussion/${postId}`, {
        content: editContent.trim()
      })
      setPosts(posts.map(p => p.id === postId ? response.data : p))
      setEditingPostId(null)
      setEditContent('')
      toast({
        title: t('success'),
        description: t('postUpdated')
      })
    } catch (error) {
      console.error('Error updating post:', error)
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorUpdatingPost'),
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm(t('confirmDeletePost'))) return

    try {
      await api.delete(`/discussion/${postId}`)
      setPosts(posts.filter(p => p.id !== postId))
      toast({
        title: t('success'),
        description: t('postDeleted')
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorDeletingPost'),
        variant: 'destructive'
      })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isAuthenticated() ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('addPost')}
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={t('writeYourMessage')}
                  className="w-full min-h-[100px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={submitting}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!newPostContent.trim() || submitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? t('posting') : t('post')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <LogIn className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t('loginToParticipate')}</p>
              <Button asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('login')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('noDiscussionYet')}
                </h3>
                <p className="text-muted-foreground">
                  {t('beFirstToPost')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((post) => (
            <Card key={post.id}>
              <CardContent className="">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Link to={`/profile/${post.user.id}`}>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                        <span className="text-primary font-semibold">
                          {(post.user.name || post.user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </Link>
                    <div>
                      <Link to={`/profile/${post.user.id}`} className="font-semibold hover:text-primary transition-colors">
                        {post.user.name || post.user.email.split('@')[0]}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(post.createdAt, t, language)}
                        {post.updatedAt !== post.createdAt && (
                          <span className="ml-1">({t('edited')})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {user?.id === post.userId && (
                    <div className="flex space-x-2">
                      {editingPostId !== post.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(post)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {editingPostId === post.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[80px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={submitting}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button

                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                        disabled={submitting}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t('cancel')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditPost(post.id)}
                        disabled={!editContent.trim() || submitting}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {t('save')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

