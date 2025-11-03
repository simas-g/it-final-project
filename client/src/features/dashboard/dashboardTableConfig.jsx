import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Lock, Calendar, FileText } from 'lucide-react'

export const getInventoryColumns = (t) => [
  {
    key: 'name',
    header: 'Name',
    render: (inventory) => (
      <div className="flex items-center gap-2 flex-wrap">
        <Link to={`/inventory/${inventory.id}`}>
          {inventory.name}
        </Link>
        {inventory.category && (
          <Badge variant="default" className="text-xs">
            {inventory.category.name}
          </Badge>
        )}
      </div>
    )
  },
  {
    key: 'description',
    header: 'Description',
    cellClassName: 'text-sm text-muted-foreground',
    render: (inventory) => inventory.description || '-'
  },
  {
    key: 'visibility',
    header: 'Visibility',
    render: (inventory) => (
      <Badge variant={inventory.isPublic ? 'secondary' : 'outline'} className="text-xs">
        {inventory.isPublic ? (
          <><Globe className="h-3 w-3 mr-1 inline" />{t('public')}</>
        ) : (
          <><Lock className="h-3 w-3 mr-1 inline" />{t('private')}</>
        )}
      </Badge>
    )
  },
  {
    key: 'items',
    header: 'Items',
    headerClassName: 'text-center',
    cellClassName: 'text-center text-sm',
    render: (inventory) => inventory._count?.items || 0
  },
  {
    key: 'created',
    header: 'Created',
    cellClassName: 'text-sm text-muted-foreground whitespace-nowrap',
    render: (inventory) => (
      <>
        <Calendar className="h-4 w-4 inline mr-1" />
        {new Date(inventory.createdAt).toLocaleDateString()}
      </>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    headerClassName: 'text-center',
    render: (inventory) => (
      <Button variant="outline" size="sm" asChild>
        <Link to={`/inventory/${inventory.id}`}>
          {t('view')}
        </Link>
      </Button>
    )
  }
]

export const renderInventoryCard = (inventory, t) => (
  <div className="flex items-center justify-between">
    <div className="flex-1 min-w-0 space-y-1">
      <div className="flex items-center flex-wrap gap-2">
        <Link
          to={`/inventory/${inventory.id}`}
          className="text-lg font-semibold hover:underline truncate"
        >
          {inventory.name}
        </Link>
        {inventory.isPublic ? (
          <Badge variant="secondary" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            {t('public')}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            {t('private')}
          </Badge>
        )}
        {inventory.category && (
          <Badge variant="default" className="text-xs">
            {inventory.category.name}
          </Badge>
        )}
      </div>
      {inventory.description && (
        <p className="text-sm text-muted-foreground truncate">
          {inventory.description}
        </p>
      )}
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <span className="flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          {inventory._count?.items || 0} {t('items')}
        </span>
        <span className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(inventory.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
    <Button variant="outline" size="sm" asChild>
      <Link to={`/inventory/${inventory.id}`}>
        {t('view')}
      </Link>
    </Button>
  </div>
)

export const getAccessInventoryColumns = (t) => [
  ...getInventoryColumns(t).slice(0, 1).map(col => ({
    ...col,
    render: (inventory) => (
      <div className="flex items-center gap-2 flex-wrap">
        <Link to={`/inventory/${inventory.id}`}>
          {inventory.name}
        </Link>
        <Badge variant="default" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          {t('writeAccess')}
        </Badge>
      </div>
    )
  })),
  {
    key: 'owner',
    header: 'Owner',
    cellClassName: 'text-sm text-muted-foreground',
    render: (inventory) => inventory.user?.name || inventory.user?.email
  },
  ...getInventoryColumns(t).slice(1)
]

export const renderAccessInventoryCard = (inventory, t) => (
  <div className="flex items-center justify-between">
    <div className="flex-1 min-w-0 space-y-1">
      <div className="flex items-center space-x-2 flex-wrap">
        <Link
          to={`/inventory/${inventory.id}`}
          className="text-lg font-semibold hover:underline truncate"
        >
          {inventory.name}
        </Link>
        {inventory.isPublic ? (
          <Badge variant="secondary" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            {t('public')}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            {t('private')}
          </Badge>
        )}
        <Badge variant="default" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          {t('writeAccess')}
        </Badge>
      </div>
      {inventory.description && (
        <p className="text-sm text-muted-foreground truncate">
          {inventory.description}
        </p>
      )}
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <span className="flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          {inventory._count?.items || 0} {t('items')}
        </span>
        <span className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(inventory.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
    <Button variant="outline" size="sm" asChild>
      <Link to={`/inventory/${inventory.id}`}>
        {t('view')}
      </Link>
    </Button>
  </div>
)

