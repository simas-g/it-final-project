import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Send } from 'lucide-react'

const DiscussionPostForm = ({ content, onChange, onSubmit, submitting, t }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('addPost')}
            </label>
            <textarea
              value={content}
              onChange={onChange}
              placeholder={`${t('writeYourMessage')} (Markdown supported)`}
              className="w-full min-h-[100px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!content.trim() || submitting}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? t('posting') : t('post')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default DiscussionPostForm

