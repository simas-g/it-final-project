import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

const DiscussionLoginPrompt = ({ t }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-4">
          <LogIn className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">{t('loginToParticipate')}</p>
          <Button asChild>
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-2" />
              {t('login')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DiscussionLoginPrompt

