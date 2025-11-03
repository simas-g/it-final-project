import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import DataTable from '@/components/ui/data-table'
import CardList from '@/components/ui/card-list'
import { useUserProfile } from './UserProfileContext'
import { useI18n } from '@/contexts/I18nContext'

const LikesTab = () => {
  const { profileUser, isOwnProfile, likesPagination } = useUserProfile()
  const { t } = useI18n()
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('likedItems')} ({profileUser.itemLikes?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileUser.itemLikes?.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('noLikes')}
              </h3>
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? t('startLikingItems')
                  : t('userHasNoLikes')
                }
              </p>
            </div>
          ) : (
            <>
              <DataTable 
                columns={[
                  {
                    key: 'customId',
                    header: 'Custom ID',
                    render: (like) => (
                      <Link 
                        to={`/item/${like.item.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {like.item.customId || like.item.id}
                      </Link>
                    )
                  },
                  {
                    key: 'inventory',
                    header: 'Inventory',
                    cellClassName: 'text-sm text-muted-foreground',
                    render: (like) => like.item.inventory.name
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    cellClassName: 'text-sm text-muted-foreground',
                    render: () => (
                      <>
                        <Heart className="h-4 w-4 inline mr-1 fill-current" />
                        {t('liked')}
                      </>
                    )
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    headerClassName: 'text-right',
                    render: (like) => (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/item/${like.item.id}`}>
                          {t('view')}
                        </Link>
                      </Button>
                    )
                  }
                ]}
                data={profileUser.itemLikes}
              />
              <CardList 
                data={profileUser.itemLikes}
                renderCard={(like) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        <Link 
                          to={`/item/${like.item.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {like.item.customId || like.item.id}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('fromInventory')}: {like.item.inventory.name}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Heart className="h-4 w-4 mr-1 fill-current" />
                        {t('liked')}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/item/${like.item.id}`}>
                        {t('view')}
                      </Link>
                    </Button>
                  </div>
                )}
              />
            </>
          )}
        </CardContent>
      </Card>
      {profileUser?.pagination?.likes && profileUser.pagination.likes.pages > 1 && (
        <Pagination 
          pagination={profileUser.pagination.likes} 
          onPageChange={likesPagination.goToPage} 
        />
      )}
    </div>
  )
}

export default LikesTab

