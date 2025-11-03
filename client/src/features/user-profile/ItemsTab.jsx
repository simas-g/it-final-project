import { Link } from 'react-router-dom'
import { FileText, Calendar, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import DataTable from '@/components/ui/data-table'
import CardList from '@/components/ui/card-list'
import { useUserProfile } from './UserProfileContext'
import { useI18n } from '@/contexts/I18nContext'

const ItemsTab = () => {
  const { profileUser, isOwnProfile, itemsPagination } = useUserProfile()
  const { t } = useI18n()
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('items')} ({profileUser.items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileUser.items?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('noItems')}
              </h3>
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? t('addFirstItem')
                  : t('userHasNoItems')
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
                    render: (item) => (
                      <Link 
                        to={`/item/${item.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {item.customId || item.id}
                      </Link>
                    )
                  },
                  {
                    key: 'inventory',
                    header: 'Inventory',
                    cellClassName: 'text-sm text-muted-foreground',
                    render: (item) => item.inventory.name
                  },
                  {
                    key: 'created',
                    header: 'Created',
                    cellClassName: 'text-sm text-muted-foreground whitespace-nowrap',
                    render: (item) => (
                      <>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </>
                    )
                  },
                  {
                    key: 'likes',
                    header: 'Likes',
                    headerClassName: 'text-center',
                    cellClassName: 'text-center text-sm',
                    render: (item) => item._count?.likes > 0 ? (
                      <span className="flex items-center justify-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {item._count.likes}
                      </span>
                    ) : '-'
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    headerClassName: 'text-right',
                      render: (item) => (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/item/${item.id}`}>
                            {t('view')}
                          </Link>
                        </Button>
                      )
                  }
                ]}
                data={profileUser.items}
              />
              <CardList 
                data={profileUser.items}
                renderCard={(item) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        <Link 
                          to={`/item/${item.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.customId || item.id}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('fromInventory')}: {item.inventory.name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        {item._count?.likes > 0 && (
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {item._count.likes} {t('likes')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/item/${item.id}`}>
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
      {profileUser?.pagination?.items && profileUser.pagination.items.pages > 1 && (
        <Pagination 
          pagination={profileUser.pagination.items} 
          onPageChange={itemsPagination.goToPage} 
        />
      )}
    </div>
  )
}

export default ItemsTab

