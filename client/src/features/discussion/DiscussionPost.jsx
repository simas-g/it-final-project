import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/formatting'
import { Edit2, Trash2, X, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useDiscussion } from './DiscussionContext'
import { useI18n } from '@/contexts/I18nContext'

const DiscussionPost = ({ post }) => {
  const { currentUserId, editingPostId, editContent, setEditContent, startEditing, cancelEditing, handleEditPost, handleDeletePost, submitting, t } = useDiscussion()
  const { language } = useI18n()
  const isOwner = currentUserId === post.userId
  const isEditing = editingPostId === post.id

  return (
    <Card>
      <CardContent>
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
          {isOwner && !isEditing && (
            <div className="flex space-x-2">
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
            </div>
          )}
        </div>

        {isEditing ? (
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DiscussionPost

