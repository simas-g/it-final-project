import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, ArrowUpDown } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { useAccessManagement } from './AccessManagementContext'
import { AddUserForm } from './AddUserForm'
import { UserAccessList } from './UserAccessList'

export const UserAccessCard = () => {
  const { t } = useI18n()
  const { 
    showAddUser, 
    setShowAddUser, 
    accessList, 
    sortBy, 
    toggleSortBy 
  } = useAccessManagement()
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4 justify-between">
          <div className='gap-2 flex flex-col'>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {t('userAccess')}
            </CardTitle>
            <CardDescription>
              {t('userAccessDescription')}
            </CardDescription>
          </div>
          {!showAddUser && (
            <div className="flex gap-2">
              {accessList.length > 0 && (
                <Button variant="outline" onClick={toggleSortBy}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortBy === 'name' ? t('sortByName') : t('sortByEmail')}
                </Button>
              )}
              <Button onClick={() => setShowAddUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('addUser')}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddUser && <AddUserForm />}
        <UserAccessList />
      </CardContent>
    </Card>
  )
}

