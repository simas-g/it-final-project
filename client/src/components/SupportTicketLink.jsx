import { useState } from 'react'
import SupportTicketDialog from './SupportTicketDialog'
import { useInventoryDetail } from '@/features/inventory-detail/InventoryDetailContext'
import { useItemDetail } from '@/features/item-detail/ItemDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const SupportTicketLink = () => {
  const { t } = useI18n()
  const [dialogOpen, setDialogOpen] = useState(false)
  let inventoryTitle = null
  
  try {
    const inventoryContext = useInventoryDetail()
    inventoryTitle = inventoryContext?.inventory?.name || null
  } catch {
    try {
      const itemContext = useItemDetail()
      inventoryTitle = itemContext?.item?.inventory?.name || null
    } catch {
      inventoryTitle = null
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          setDialogOpen(true)
        }}
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        {t('supportTicket.createSupportTicketLink')}
      </button>
      <SupportTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        inventoryTitle={inventoryTitle}
      />
    </>
  )
}

export default SupportTicketLink

