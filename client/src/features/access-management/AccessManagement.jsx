import { AccessManagementProvider, useAccessManagement } from './AccessManagementContext'
import { PublicAccessCard } from './PublicAccessCard'
import { UserAccessCard } from './UserAccessCard'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useI18n } from '@/contexts/I18nContext'

const AccessManagement = ({ inventoryId, isOwner }) => {
  if (!isOwner) return null
  const Content = () => {
    const { loading, confirmDialogOpen, setConfirmDialogOpen, confirmRemoveAccess } = useAccessManagement()
    const { t } = useI18n()
    if (loading) return <LoadingSpinner />
    return (
      <>
        <div className="space-y-6">
          <PublicAccessCard />
          <UserAccessCard />
        </div>
        <ConfirmDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          title={t('confirmRemoveAccess')}
          description={t('confirmRemoveAccessDescription')}
          confirmText={t('remove')}
          cancelText={t('cancel')}
          onConfirm={confirmRemoveAccess}
          variant="destructive"
        />
      </>
    )
  }

  return (
    <AccessManagementProvider inventoryId={inventoryId} isOwner={isOwner}>
      <Content />
    </AccessManagementProvider>
  )
}

export default AccessManagement