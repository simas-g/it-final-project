import { useI18n } from '@/contexts/I18nContext'
import TrendingItem from './TrendingItem'

const TrendingSection = ({ inventories }) => {
  const { t } = useI18n()
  return (
    <section>
      <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
        <h2 className="text-xl sm:text-2xl font-bold">
          {t('trending')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('mostPopular')}
        </p>
      </div>
      <div className="space-y-3 grid grid-cols-1 gap-4">
        {inventories.map((inventory, idx) => (
          <TrendingItem 
            key={inventory.id} 
            inventory={inventory} 
            rank={idx + 1} 
          />
        ))}
      </div>
    </section>
  )
}

export default TrendingSection

