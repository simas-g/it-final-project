import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import ReactMarkdown from 'react-markdown'
import { useUserProfile } from './UserProfileContext'
import { useI18n } from '@/contexts/I18nContext'

const PostsTab = () => {
  const { profileUser, isOwnProfile, postsPagination } = useUserProfile()
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('posts')} ({profileUser.discussionPosts?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileUser.discussionPosts?.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('noPosts')}
              </h3>
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? t('startDiscussion')
                  : t('userHasNoPosts')
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profileUser.discussionPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-semibold">
                          <Link 
                            to={`/inventory/${post.inventory.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.inventory.name}
                          </Link>
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert p-2">
                        <ReactMarkdown>
                          {post.content.length > 200 
                            ? `${post.content.substring(0, 200)}...` 
                            : post.content
                          }
                        </ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {profileUser?.pagination?.posts && profileUser.pagination.posts.pages > 1 && (
        <Pagination 
          pagination={profileUser.pagination.posts} 
          onPageChange={postsPagination.goToPage} 
        />
      )}
    </div>
  )
}

export default PostsTab

