import { Users } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { useAccessManagement } from './AccessManagementContext'
import { UserAccessItem } from './UserAccessItem'

export const UserAccessList = () => {
  const { t } = useI18n()
  const { accessList } = useAccessManagement()

  if (accessList.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t('noSharedUsers')}
        </h3>
        <p className="text-muted-foreground">
          {t('noSharedUsersDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {accessList.map((access) => (
        <UserAccessItem key={access.id} access={access} />
      ))}
    </div>
  )
}

