import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export const LivePreview = ({ preview }) => (
  <Card className="border-2 border-primary">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Sparkles className="mr-2 h-5 w-5" />
        Live Preview
      </CardTitle>
      <CardDescription>
        This is how the generated ID will look
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="p-4 bg-muted rounded-lg font-mono text-lg break-all">
        {preview || 'No preview available'}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Note: Random numbers and GUIDs will be different for each item
      </p>
    </CardContent>
  </Card>
)

