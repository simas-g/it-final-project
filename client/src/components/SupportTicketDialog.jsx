import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/I18nContext'
import api from '@/lib/api'

const SupportTicketDialog = ({ open, onOpenChange, inventoryTitle = null }) => {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const location = useLocation()
  const [summary, setSummary] = useState('')
  const [priority, setPriority] = useState('')
  const [adminEmails, setAdminEmails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const getCurrentPageLink = () => {
    return window.location.origin + location.pathname + location.search
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!summary.trim()) {
      toast({
        title: t('error'),
        description: t('supportTicket.summaryRequired'),
        variant: 'destructive',
      })
      return
    }

    if (!priority) {
      toast({
        title: t('error'),
        description: t('supportTicket.priorityRequired'),
        variant: 'destructive',
      })
      return
    }

    if (!adminEmails.trim()) {
      toast({
        title: t('error'),
        description: t('supportTicket.adminEmailsRequired'),
        variant: 'destructive',
      })
      return
    }

    const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email.length > 0)
    if (emailList.length === 0) {
      toast({
        title: t('error'),
        description: t('supportTicket.validEmailsRequired'),
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const ticketData = {
        reportedBy: user?.email || user?.name || 'Unknown',
        inventory: inventoryTitle || '',
        link: getCurrentPageLink(),
        priority,
        adminEmails: emailList,
        summary,
      }

      const response = await api.post('/support/upload-ticket', ticketData)
      
      toast({
        title: t('supportTicket.ticketCreated'),
        description: t('supportTicket.ticketUploadedSuccessfully'),
      })

      setSummary('')
      setPriority('')
      setAdminEmails('')
      onOpenChange(false)
    } catch (error) {
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('supportTicket.ticketUploadFailed'),
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('supportTicket.createSupportTicket')}</DialogTitle>
          <DialogDescription>
            {t('supportTicket.createSupportTicketDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="summary">
                {t('supportTicket.summary')} <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('supportTicket.summaryPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                {t('supportTicket.priority')} <span className="text-destructive">*</span>
              </Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder={t('supportTicket.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">{t('supportTicket.high')}</SelectItem>
                  <SelectItem value="Average">{t('supportTicket.average')}</SelectItem>
                  <SelectItem value="Low">{t('supportTicket.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmails">
                {t('supportTicket.adminEmails')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="adminEmails"
                value={adminEmails}
                onChange={(e) => setAdminEmails(e.target.value)}
                placeholder={t('supportTicket.adminEmailsPlaceholder')}
                className="h-11 border-2"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('supportTicket.adminEmailsHint')}
              </p>
            </div>

            <div className="rounded-md border p-3 bg-muted/50">
              <p className="text-xs font-medium mb-2">{t('supportTicket.ticketInformation')}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>{t('supportTicket.reportedBy')}:</strong> {user?.email || user?.name || 'Unknown'}</p>
                {inventoryTitle && (
                  <p><strong>{t('inventory')}:</strong> {inventoryTitle}</p>
                )}
                <p><strong>{t('supportTicket.link')}:</strong> <span className="break-all text-[10px]">{getCurrentPageLink()}</span></p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('supportTicket.submitting') : t('supportTicket.submitTicket')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SupportTicketDialog

