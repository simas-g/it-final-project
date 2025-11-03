import { useI18n } from '@/contexts/I18nContext'
import { DiscussionProvider, useDiscussion } from './DiscussionContext'
import DiscussionPostForm from './DiscussionPostForm'
import DiscussionLoginPrompt from './DiscussionLoginPrompt'
import DiscussionEmptyState from './DiscussionEmptyState'
import DiscussionPost from './DiscussionPost'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const DiscussionContent = () => {
  const { t } = useI18n()
  const {
    isAuthenticated,
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    submitting,
    handleCreatePost,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmDeletePost,
  } = useDiscussion()

  if (loading) return <LoadingSpinner />

  return (
    <>
      <div className="space-y-6">
        {isAuthenticated && (
          <DiscussionPostForm
            content={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onSubmit={handleCreatePost}
            submitting={submitting}
            t={t}
          />
        )
        }
        {!isAuthenticated && (
          <DiscussionLoginPrompt t={t} />
        )}

        <div className="space-y-4">
          {posts.length === 0 && (
            <DiscussionEmptyState />
          )}
          {posts.length > 0 && (
            posts
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((post) => (
                <DiscussionPost
                  key={post.id}
                  post={post}
                />
              ))
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={t('confirmDeletePost')}
        description={t('confirmDeletePostDescription')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        onConfirm={confirmDeletePost}
        variant="destructive"
      />
    </>
  )
}

const Discussion = ({ inventoryId }) => {
  return (
    <DiscussionProvider inventoryId={inventoryId}>
      <DiscussionContent />
    </DiscussionProvider>
  )
}

export default Discussion
