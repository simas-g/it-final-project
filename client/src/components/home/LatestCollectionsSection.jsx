import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import InventoryCard from './InventoryCard'

const LatestCollectionsSection = ({ inventories }) => {
  const { t } = useI18n()
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {t('latestCollections')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('recentlyCreated')}
          </p>
        </div>
        <Button variant="ghost" asChild className="self-start sm:self-auto">
          <Link to="/search">
            {t('viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {inventories.map((inventory) => (
          <InventoryCard key={inventory.id} inventory={inventory} />
        ))}
      </div>
    </section>
  )
}

export default LatestCollectionsSection

