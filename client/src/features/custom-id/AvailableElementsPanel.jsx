import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus } from 'lucide-react'
import { ELEMENT_TYPES } from '@/lib/inventoryConstants'

export const AvailableElementsPanel = ({ elements, onAddElement }) => (
  <Card className="border-2">
    <CardHeader>
      <CardTitle>Available Elements</CardTitle>
      <CardDescription>
        Click to add to your ID format
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {ELEMENT_TYPES.map((elementType) => {
        const Icon = elementType.icon
        return (
          <button
            key={elementType.value}
            onClick={() => onAddElement(elementType.value)}
            disabled={elements.length >= 10}
            className="w-full text-left p-3 border-2 rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start space-x-3">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{elementType.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {elementType.description}
                </p>
              </div>
              <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </button>
        )
      })}
      {elements.length >= 10 && (
        <Alert>
          <AlertDescription className="text-xs">
            Maximum 10 elements reached
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
)

