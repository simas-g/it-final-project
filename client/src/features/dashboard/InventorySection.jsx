import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table'
import CardList from '@/components/ui/card-list'
import { Plus, Package } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const InventorySection = ({ title, inventories, columns, renderCard }) => {
  const { t } = useI18n()
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {inventories.length} {inventories.length === 1 ? t('inventory') : t('inventories')}
        </p>
      </div>
      {inventories.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noInventories')}</h3>
              <p className="text-muted-foreground mb-4">{t('createYourFirst')}</p>
              <Button asChild size="lg">
                <Link to="/inventory/new">
                  <Plus className="mr-2 h-5 w-5" />
                  {t('createInventory')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <DataTable 
            columns={columns}
            data={inventories}
          />
          <CardList 
            data={inventories}
            renderCard={renderCard}
          />
        </>
      )}
    </div>
  )
}

