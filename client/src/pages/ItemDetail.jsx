import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import {
  ItemDetailProvider,
  useItemDetail,
  ItemHeader,
  ItemFieldsCard,
  ItemLikesCard,
  ItemInfoCard,
  ItemActionsCard
} from '@/features/item-detail'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { fetchItem } from '@/queries/api'

const ItemDetailContent = () => {
  const { t } = useI18n()
  const { confirmDialogOpen, setConfirmDialogOpen, confirmDelete } = useItemDetail()

  return (
    <>
      <div className="space-y-6">
        <ItemHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ItemFieldsCard />
            <ItemLikesCard />
          </div>

          <div className="space-y-6">
            <ItemInfoCard />
            <ItemActionsCard />
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={t('confirmDeleteItem')}
        description={t('confirmDeleteItemDescription')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}

const ItemDetail = () => {
  const { id } = useParams()
  const { t } = useI18n()

  const { data: item, isLoading: loading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
  })

  if (loading) return <LoadingSpinner message={t('loading')} />

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('itemNotFound')}</h2>
          <Button asChild>
            <Link to="/dashboard">{t('backToDashboard')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ItemDetailProvider item={item}>
      <ItemDetailContent />
    </ItemDetailProvider>
  )
}

export default ItemDetail
