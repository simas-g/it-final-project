import { Link } from 'react-router-dom'
import { Package, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import DataTable from '@/components/ui/data-table'
import CardList from '@/components/ui/card-list'
import { useInventoryDetail } from './InventoryDetailContext'
import { useI18n } from '@/contexts/I18nContext'
import LoadingSpinner from '@/components/ui/loading-spinner'

const InventoryItemsTab = () => {
  const { items, inventory, itemsLoading, hasWriteAccess, itemsPagination, goToItemsPage } = useInventoryDetail()
  const { t } = useI18n()
  const visibleFields = inventory.fields?.filter(f => f.showInTable) || []
  const renderFieldValue = (field, item) => {
    if (field.fieldType === 'BOOLEAN') {
      return (
        <Badge variant={item.fields?.[field.id] ? "default" : "outline"}>
          {item.fields?.[field.id] === true ? 'Yes' : item.fields?.[field.id] === false ? 'No' : '-'}
        </Badge>
      )
    }
    if (field.fieldType === 'MULTI_LINE_TEXT') {
      return <span className="text-sm line-clamp-2">{item.fields?.[field.id] || '-'}</span>
    }
    if (field.fieldType === 'IMAGE_URL' && item.fields?.[field.id]) {
      return (
        <div className="flex items-center space-x-2">
          <img 
            src={item.fields[field.id]} 
            alt={field.title}
            className="w-8 h-8 rounded object-cover"
          />
          <span className="text-xs text-muted-foreground truncate max-w-20">
            {item.fields[field.id]}
          </span>
        </div>
      )
    }
    return <span className="text-sm">{item.fields?.[field.id] || '-'}</span>
  }

  const tableColumns = [
    {
      key: 'customId',
      header: 'Custom ID',
      render: (item) => (
        <span className="font-mono font-medium">{item.customId || item.id.substring(0, 8)}</span>
      )
    },
    ...visibleFields.map(field => ({
      key: field.id,
      header: field.title,
      render: (item) => renderFieldValue(field, item)
    })),
    {
      key: 'createdBy',
      header: 'Created By',
      cellClassName: 'text-sm',
      render: (item) => (
        <Link 
          to={`/profile/${item.user.id}`}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {item.user.name || item.user.email}
        </Link>
      )
    },
    {
      key: 'createdAt',
      header: 'Created At',
      cellClassName: 'text-sm text-muted-foreground whitespace-nowrap',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/item/${item.id}`}>
            {t('view')}
          </Link>
        </Button>
      )
    }
  ]

  const renderCard = (item) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">Custom ID: </span>
            <p className='font-mono font-medium'>{item.customId || item.id.substring(0, 8)}</p>
          </div>
          {visibleFields.map(field => (
            <div key={field.id} className="text-sm break-words">
              <span className="text-muted-foreground font-medium">{field.title}: </span>
              {field.fieldType === 'BOOLEAN' ? (
                <Badge variant={item.fields?.[field.id] ? "default" : "outline"} className="text-xs">
                  {item.fields?.[field.id] === true ? 'Yes' :  item.fields?.[field.id] === false ? 'No' : '-'}
                </Badge>
              ) : field.fieldType === 'IMAGE_URL' && item.fields?.[field.id] ? (
                <div className="mt-1">
                  <img 
                    src={item.fields[field.id]} 
                    alt={field.title}
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              ) : field.fieldType === 'MULTI_LINE_TEXT' ? (
                <span className="line-clamp-3 block">{item.fields?.[field.id] || '-'}</span>
              ) : (
                <span className="break-words">{item.fields?.[field.id] || '-'}</span>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0 self-start">
          <Link to={`/item/${item.id}`}>
            {t('view')}
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <Link 
          to={`/profile/${item.user.id}`}
          className="hover:text-primary transition-colors truncate"
        >
          {item.user.name || item.user.email.split('@')[0]}
        </Link>
        <span className="shrink-0 ml-2">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('items')}</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <LoadingSpinner message={t('loading')} />
          ) : items?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('noItems')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('addFirstItem')}
              </p>
              {hasWriteAccess && (
                <Button asChild>
                  <Link to={`/inventory/${inventory.id}/item/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addItem')}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DataTable columns={tableColumns} data={items || []} />
              </div>
              <CardList 
                data={items || []} 
                renderCard={renderCard} 
                className="md:hidden"
              />
            </>
          )}
        </CardContent>
      </Card>
      {itemsPagination && itemsPagination.pages > 1 && (
        <Pagination pagination={itemsPagination} onPageChange={goToItemsPage} />
      )}
    </div>
  )
}

export default InventoryItemsTab

