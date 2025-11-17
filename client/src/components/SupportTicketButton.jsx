import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SupportTicketDialog from './SupportTicketDialog'
import { useInventoryDetail } from '@/features/inventory-detail/InventoryDetailContext'
import { useItemDetail } from '@/features/item-detail/ItemDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const SupportTicketButton = () => {
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="flex items-center space-x-2"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">{t('supportTicket.help')}</span>
      </Button>
      <SupportTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        inventoryTitle={inventoryTitle}
      />
    </>
  )
}

export default SupportTicketButton

