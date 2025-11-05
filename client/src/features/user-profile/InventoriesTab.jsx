import { Link } from 'react-router-dom'
import { Package, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import DataTable from '@/components/ui/data-table'
import CardList from '@/components/ui/card-list'
import { useUserProfile } from './UserProfileContext'
import { useI18n } from '@/contexts/I18nContext'

const InventoriesTab = () => {
  const { profileUser, isOwnProfile, inventoriesPagination } = useUserProfile()
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('inventories')} ({profileUser.inventories?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileUser.inventories?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('noInventories')}
              </h3>
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? t('createFirstInventory')
                  : t('userHasNoInventories')
                }
              </p>
            </div>
          ) : (
            <>
              <DataTable 
                columns={[
                  {
                    key: 'name',
                    header: 'Name',
                    render: (inventory) => (
                      <Link 
                        to={`/inventory/${inventory.id}`}
                      >
                        {inventory.name}
                      </Link>
                    )
                  },
                  {
                    key: 'description',
                    header: 'Description',
                    cellClassName: 'text-sm text-muted-foreground',
                    render: (inventory) => inventory.description || t('noDescription')
                  },
                  {
                    key: 'visibility',
                    header: 'Accessibility',
                    render: (inventory) => (
                      <Badge variant={inventory.isPublic ? 'secondary' : 'outline'}>
                        {inventory.isPublic ? t('public') : t('private')}
                      </Badge>
                    )
                  },
                  {
                    key: 'items',
                    header: 'Items',
                    headerClassName: 'text-center',
                    cellClassName: 'text-center text-sm',
                    render: (inventory) => (
                      <span className="flex items-center justify-center">
                        <Package className="h-4 w-4 mr-1" />
                        {inventory._count?.items || 0}
                      </span>
                    )
                  },
                  {
                    key: 'created',
                    header: 'Created',
                    headerClassName: 'text-right',
                    cellClassName: 'text-right text-sm text-muted-foreground',                    render: (inventory) => (
                      <>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(inventory.createdAt).toLocaleDateString()}
                      </>
                    )
                  }
                ]}
                data={profileUser.inventories}
              />
              <CardList 
                data={profileUser.inventories}
                className="md:hidden grid grid-cols-1 gap-4"
                renderCard={(inventory) => (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="text-lg font-semibold">
                          <Link 
                            to={`/inventory/${inventory.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {inventory.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {inventory.description || t('noDescription')}
                        </p>
                      </div>
                      {inventory.isPublic && (
                        <Badge variant="secondary">
                          {t('public')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {inventory._count?.items || 0} {t('items')}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(inventory.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              />
            </>
          )}
        </CardContent>
      </Card>
      {profileUser?.pagination?.inventories && profileUser.pagination.inventories.pages > 1 && (
        <Pagination 
          pagination={profileUser.pagination.inventories} 
          onPageChange={inventoriesPagination.goToPage} 
        />
      )}
    </div>
  )
}

export default InventoriesTab

