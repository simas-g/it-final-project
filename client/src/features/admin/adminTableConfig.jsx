import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX, Shield, Trash2 } from 'lucide-react'

export const getAdminTableColumns = (t, handleToggleBlock, handleChangeRole, handleDeleteUser) => [
  {
    key: 'user',
    header: 'User',
    render: (user) => (
      <div className="flex items-center gap-2">
        <span>{user.name || user.email.split('@')[0]}</span>
        {user.isBlocked && (
          <Badge variant="destructive" className="text-xs">{t('blocked')}</Badge>
        )}
      </div>
    )
  },
  {
    key: 'email',
    header: 'Email',
    cellClassName: 'text-sm text-muted-foreground',
    render: (user) => user.email
  },
  {
    key: 'role',
    header: 'Role',
    render: (user) => (
      <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
        {user.role}
      </Badge>
    )
  },
  {
    key: 'inventories',
    header: 'Inventories',
    headerClassName: 'text-center',
    cellClassName: 'text-center text-sm',
    render: (user) => user._count?.inventories || 0
  },
  {
    key: 'items',
    header: 'Items',
    headerClassName: 'text-center',
    cellClassName: 'text-center text-sm',
    render: (user) => user._count?.items || 0
  },
  {
    key: 'posts',
    header: 'Posts',
    headerClassName: 'text-center',
    cellClassName: 'text-center text-sm',
    render: (user) => user._count?.discussionPosts || 0
  },
  {
    key: 'actions',
    header: 'Actions',
    headerClassName: 'text-right',
    render: (user) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleBlock(user.id, user.isBlocked)
          }}
          title={user.isBlocked ? t('unblock') : t('block')}
        >
          {user.isBlocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
            handleChangeRole(user.id, newRole)
          }}
          title={user.role === 'ADMIN' ? t('removeAdmin') : t('makeAdmin')}
        >
          <Shield className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteUser(user.id)
          }}
          className="text-destructive hover:text-destructive"
          title={t('delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]

export const renderAdminCardList = (user, t, handleToggleBlock, handleChangeRole, handleDeleteUser) => (
  <div className="flex flex-col gap-4">
    <div className="space-y-1 min-w-0 flex-1">
      <div className="flex items-center flex-wrap gap-2">
        <h3 className="font-semibold truncate">{user.name || user.email}</h3>
        <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
          {user.role}
        </Badge>
        {user.isBlocked && (
          <Badge variant="destructive">{t('blocked')}</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{user._count?.inventories || 0} {t('inventories')}</span>
        <span>{user._count?.items || 0} {t('items')}</span>
        <span>{user._count?.discussionPosts || 0} {t('posts')}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap border-t pt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleToggleBlock(user.id, user.isBlocked)}
        className="flex-1"
      >
        {user.isBlocked ? (
          <>
            <UserCheck className="h-4 w-4 mr-2" />
            <span>{t('unblock')}</span>
          </>
        ) : (
          <>
            <UserX className="h-4 w-4 mr-2" />
            <span>{t('block')}</span>
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
          handleChangeRole(user.id, newRole)
        }}
        className="flex-1"
      >
        <Shield className="h-4 w-4 mr-2" />
        <span>{user.role === 'ADMIN' ? t('removeAdmin') : t('makeAdmin')}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDeleteUser(user.id)}
        className="text-destructive hover:text-destructive flex-1"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
)

