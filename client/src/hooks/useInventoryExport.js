import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/I18nContext'
import api from '@/lib/api'
import { exportToExcel, exportToCSV } from '@/lib/exportUtils'

export const useInventoryExport = (inventoryId) => {
  const { toast } = useToast()
  const { getTranslation, language } = useI18n()
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format) => {
    if (exporting) return
    
    setExporting(true)
    try {
      toast({
        title: getTranslation('exportingInventory', language),
        description: format === 'excel' 
          ? getTranslation('exportToExcel', language) 
          : getTranslation('exportToCsv', language)
      })
      
      const response = await api.get(`/inventories/${inventoryId}/export`)
      const { inventory: exportInventory, items: exportItems } = response.data
      
      if (format === 'excel') {
        exportToExcel(exportInventory, exportItems)
      } else {
        exportToCSV(exportInventory, exportItems)
      }
      
      toast({
        title: getTranslation('exportSuccess', language),
        variant: 'default'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: getTranslation('exportError', language),
        description: error.response?.data?.error || error.message,
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  return { handleExport, exporting }
}

