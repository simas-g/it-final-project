import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import LoadingSpinner from '@/components/ui/loading-spinner'
import DataTable from '@/components/ui/data-table'
import CardList from '@/components/ui/card-list'
import { usePagination } from '@/hooks/usePagination'
import { 
  useAdminPanel,
  AdminStats,
  getAdminTableColumns,
  renderAdminCardList
} from '@/features/admin'
import { fetchAdminUsers, fetchAdminStats } from '@/queries/api'
import { Search } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const AdminPanel = () => {
  const { isAdmin } = useAuth()
  const { getTranslation, language } = useI18n()
  const { page, limit, goToPage } = usePagination(1, 20)
  const {
    searchQuery,
    setSearchQuery,
    searchTerm,
    confirmDialogOpen,
    setConfirmDialogOpen,
    handleToggleBlock,
    handleChangeRole,
    handleDeleteUser,
    confirmDeleteUser,
    handleSearch,
    handleKeyDown
  } = useAdminPanel()
  
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', page, limit, searchTerm],
    queryFn: () => fetchAdminUsers({ page, limit, search: searchTerm }),
    enabled: isAdmin(),
  })

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    enabled: isAdmin(),
  })

  const users = usersData?.users || []
  const pagination = usersData?.pagination || null
  const loading = usersLoading

  const t = (key) => getTranslation(key, language)
  const tableColumns = getAdminTableColumns(t, handleToggleBlock, handleChangeRole, handleDeleteUser)
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getTranslation('accessDenied', language)}</h2>
          <p className="text-muted-foreground">
            {getTranslation('adminAccessRequired', language)}
          </p>
        </div>
      </div>
    )
  }
  if (loading) return <LoadingSpinner message={getTranslation('loading', language)} />
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getTranslation('adminPanel', language)}</h1>
          <p className="text-muted-foreground">
            {getTranslation('adminPanelDescription', language)}
          </p>
        </div>
      </div>
      <AdminStats stats={stats} />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>{getTranslation('userManagement', language)}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={getTranslation('searchUsers', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, goToPage)}
                  className="pl-10 md:w-64"
                />
              </div>
              <Button onClick={() => handleSearch(goToPage)} size="sm">
                {getTranslation('search', language)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={tableColumns}
            data={users}
          />
          <CardList 
            data={users}
            renderCard={(user) => renderAdminCardList(user, t, handleToggleBlock, handleChangeRole, handleDeleteUser)}
          />
          {pagination && pagination.pages > 1 && (
            <div className="mt-6">
              <Pagination pagination={pagination} onPageChange={goToPage} />
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={getTranslation('confirmDeleteUser', language)}
        description={getTranslation('confirmDeleteUserDescription', language)}
        confirmText={getTranslation('delete', language)}
        cancelText={getTranslation('cancel', language)}
        onConfirm={confirmDeleteUser}
        variant="destructive"
      />
    </div>
  )
}

export default AdminPanel
