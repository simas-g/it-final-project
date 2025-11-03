import { Hash, Type } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const FixedFieldsInfo = () => {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-sm">Fixed Fields</CardTitle>
        <CardDescription className="text-xs">
          Always present in items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center space-x-2 p-2 bg-muted rounded">
          <Hash className="h-3 w-3" />
          <span className="font-medium">Custom ID</span>
          <Badge variant="outline" className="ml-auto text-xs">Editable</Badge>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-muted rounded">
          <Type className="h-3 w-3" />
          <span className="font-medium">Created By</span>
          <Badge variant="outline" className="ml-auto text-xs">Auto</Badge>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-muted rounded">
          <Type className="h-3 w-3" />
          <span className="font-medium">Created At</span>
          <Badge variant="outline" className="ml-auto text-xs">Auto</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default FixedFieldsInfo

