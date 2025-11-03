import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import { useI18n } from '@/contexts/I18nContext'

export const SearchHeader = ({ tag, matchingTags }) => {
  const { getTranslation, language } = useI18n()

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{getTranslation('searchResults', language)}</h1>
      
      {tag && (
        <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg border-2">
          <span className="text-sm text-muted-foreground">{getTranslation('searchingByTag', language)}</span>
          <Badge variant="default" className="text-sm">
            {tag}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="ml-auto"
          >
            <Link to="/search">{getTranslation('clearFilter', language)}</Link>
          </Button>
        </div>
      )}
      
      {!tag && matchingTags.length > 0 && (
        <div className="flex flex-col gap-2 p-4 bg-muted rounded-lg border-2">
          <span className="text-sm text-muted-foreground">{getTranslation('foundMatchingTags', language)}</span>
          <div className="flex flex-wrap gap-2">
            {matchingTags.map((tag, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                asChild
                className="h-auto py-1"
              >
                <Link to={`/search?tag=${encodeURIComponent(tag.text)}`}>
                  <Badge variant="default" className="text-sm">
                    {tag.text}
                  </Badge>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center">
        <SearchAutocomplete className="flex-1 max-w-md" />
      </div>
    </div>
  )
}

