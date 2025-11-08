import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Package, Users, Lock, Plus, FileSpreadsheet, FileType, Download, ChevronDown } from 'lucide-react'
import { useInventoryDetail } from './InventoryDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const InventoryHeader = () => {
  const { inventory, hasWriteAccess, handleExport, exporting } = useInventoryDetail()
  const { t } = useI18n()
  return (
    <div className="pb-6 border-b">
      <div className="flex flex-row items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col sm:flex-row items-start gap-4 flex-wrap flex-1 min-w-0">
          {inventory.imageUrl && (
            <div>
              <img
                src={inventory.imageUrl}
                alt={inventory.name}
                className="w-48 h-48 object-cover rounded-lg border"
              />
            </div>
          )}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold">{inventory.name}</h1>
              {inventory.isPublic ? (
                <Badge variant="secondary">{t('public')}</Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  {hasWriteAccess ? t('private') : t('viewOnly')}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {inventory.description || t('noDescription')}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <Link 
                to={`/profile/${inventory.user.id}`}
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4 mr-1" />
                {inventory.user.name || inventory.user.email}
              </Link>
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {inventory._count?.items || 0} {t('items')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={exporting || !inventory._count?.items}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {exporting ? t('exporting') : t('export')}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => handleExport('excel')}
                disabled={exporting}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {t('exportToExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="cursor-pointer"
              >
                <FileType className="h-4 w-4 mr-2" />
                {t('exportToCsv')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {hasWriteAccess && (
            <Button asChild className="flex-shrink-0">
              <Link to={`/inventory/${inventory.id}/item/new`}>
                <Plus className="h-4 w-4" />
                {t('addItem')}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryHeader

