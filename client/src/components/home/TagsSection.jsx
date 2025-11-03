import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

const TagsSection = ({ tags }) => {
  const { t } = useI18n()
  
  if (tags.length === 0) return null
  
  return (
    <section>
      <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
        <h2 className="text-xl sm:text-2xl font-bold">
          {t('browseByTags')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('exploreCategories')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="px-2 sm:px-3 py-1 cursor-pointer hover:bg-foreground hover:text-background transition-colors max-w-full"
          >
            <Link to={`/search?tag=${encodeURIComponent(tag.name)}`} className="flex items-center min-w-0">
              <Tag className="h-3 w-3 mr-1 shrink-0" />
              <span className="truncate">{tag.name}</span>
              <span className="ml-1.5 text-xs opacity-60 shrink-0">
                {tag._count?.inventories || 0}
              </span>
            </Link>
          </Badge>
        ))}
      </div>
    </section>
  )
}

export default TagsSection

