import { Search, Package, FileText } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const SearchEmptyState = ({ type = 'general' }) => {
  const { getTranslation, language } = useI18n()
  const configs = {
    general: {
      icon: Search,
      title: getTranslation('noResults', language),
      description: getTranslation('tryDifferentSearch', language)
    },
    inventories: {
      icon: Package,
      title: getTranslation('noInventoriesFound', language),
      description: getTranslation('tryDifferentSearch', language)
    },
    items: {
      icon: FileText,
      title: getTranslation('noItemsFound', language),
      description: getTranslation('tryDifferentSearch', language)
    },
    tag: {
      icon: Package,
      title: getTranslation('noInventoriesFound', language),
      description: getTranslation('noInventoriesWithTag', language)
    }
  }
  const config = configs[type] || configs.general
  const Icon = config.icon
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-muted-foreground">{config.description}</p>
    </div>
  )
}

