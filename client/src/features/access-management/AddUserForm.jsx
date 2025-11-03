import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Plus, X } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { useAccessManagement } from './AccessManagementContext'

export const AddUserForm = () => {
  const { t } = useI18n()
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    selectedUser,
    setSelectedUser,
    handleAddAccess,
    cancelAddUser,
    submitting
  } = useAccessManagement()

  return (
    <div className="border-2 border-dashed rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('addUserAccess')}</h3>
        <Button variant="ghost" size="sm" onClick={cancelAddUser}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label>{t('searchUser')}</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchByNameOrEmail')}
              className="pl-9"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user)
                    setSearchQuery('')
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                >
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
          {searching && (
            <p className="text-sm text-muted-foreground mt-2">{t('searching')}...</p>
          )}
        </div>
        {selectedUser && (
          <div className="border rounded-md p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedUser.name || selectedUser.email}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleAddAccess}
              disabled={submitting}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {submitting ? t('adding') : t('giveAccess')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

