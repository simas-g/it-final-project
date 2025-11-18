import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/I18nContext'
import { fetchAdminUserSuggestions } from '@/queries/api'
import api from '@/lib/api'
import { User, X } from 'lucide-react'

const SupportTicketDialog = ({ open, onOpenChange, inventoryTitle = null }) => {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const location = useLocation()
  const [summary, setSummary] = useState('')
  const [priority, setPriority] = useState('')
  const [selectedEmails, setSelectedEmails] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: suggestions = [], isLoading: loading } = useQuery({
    queryKey: ['adminUserSuggestions', debouncedQuery],
    queryFn: () => fetchAdminUserSuggestions(debouncedQuery, 10),
    enabled: debouncedQuery.length >= 2 && isTyping,
  })

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

    if (selectedEmails.length === 0) {
      toast({
        title: t('error'),
        description: t('supportTicket.adminEmailsRequired'),
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
        adminEmails: selectedEmails,
        summary,
      }

      const response = await api.post('/support/upload-ticket', ticketData)
      
      toast({
        title: t('supportTicket.ticketCreated'),
        description: t('supportTicket.ticketUploadedSuccessfully'),
      })

      setSummary('')
      setPriority('')
      setSelectedEmails([])
      setSearchQuery('')
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
  const filtered = suggestions.filter(suggestion => !selectedEmails.includes(suggestion.email || suggestion.text))
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
              <Select value={priority} onValueChange={setPriority} required modal={false}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder={t('supportTicket.selectPriority')} />
                </SelectTrigger>
                <SelectContent className="!z-[200]">
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
              <Command className="border-2 rounded-md" shouldFilter={false}>
                <CommandInput
                  placeholder={t('supportTicket.adminEmailsPlaceholder')}
                  value={searchQuery}
                  onValueChange={(value) => {
                    setSearchQuery(value)
                    setIsTyping(true)
                  }}
                />
                {(isTyping && searchQuery.length > 2) && (
                  <CommandList className="max-h-[200px] overflow-auto">
                    {loading && <CommandLoading className="py-4">{t('loading')}...</CommandLoading>}
                    {!loading && filtered.length === 0 && (
                      <CommandEmpty className="py-4 text-center text-muted-foreground text-sm">
                        {t('noSuggestions')}
                      </CommandEmpty>
                    )}
                    {!loading && filtered.length > 0 && (
                      <CommandGroup className="border-t">
                        {filtered
                          .map((suggestion, index) => {
                            const email = suggestion.email || suggestion.text
                            return (
                              <CommandItem
                                key={`${suggestion.type}-${email}-${index}`}
                                onSelect={() => {
                                  if (!selectedEmails.includes(email)) {
                                    setSelectedEmails([...selectedEmails, email])
                                    setSearchQuery('')
                                    setIsTyping(false)
                                  }
                                }}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <User className="h-4 w-4 text-purple-500" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{suggestion.name || email}</div>
                                  <div className="text-xs text-muted-foreground">{email}</div>
                                </div>
                              </CommandItem>
                            )
                          })}
                      </CommandGroup>
                    )}
                  </CommandList>
                )}
              </Command>
              {selectedEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => setSelectedEmails(selectedEmails.filter(e => e !== email))}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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

