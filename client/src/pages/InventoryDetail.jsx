import { useParams, Link } from 'react-router-dom'
import { useI18n } from '@/contexts/I18nContext'
import { 
  InventoryDetailProvider, 
  useInventoryDetail,
  InventoryHeader,
  InventoryItemsTab,
  InventorySettingsTab
} from '@/features/inventory-detail'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Discussion } from '@/features/discussion'
import { AccessManagement } from '@/features/access-management'
import { Package, Settings, MessageSquare, BarChart3, Lock } from 'lucide-react'
import Statistics from '@/features/inventory/Statistics'
import LoadingSpinner from '@/components/ui/loading-spinner'

const InventoryDetailContent = () => {
  const { 
    inventory, 
    loading, 
    activeTab, 
    setActiveTab, 
    isOwner, 
    isAdminOrCreator,
    statistics,
    statsLoading,
    inventoryId
  } = useInventoryDetail()
  
  const { t } = useI18n()

  if (loading) return <LoadingSpinner message={t('loading')} />

  if (!inventory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('inventoryNotFound')}</h2>
          <Button asChild>
            <Link to="/dashboard">{t('backToDashboard')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <InventoryHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="items" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            {t('items')}
          </TabsTrigger>
          <TabsTrigger value="discussion" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('discussion')}
          </TabsTrigger>
          {(isOwner || isAdminOrCreator) && (
            <TabsTrigger value="access" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              {t('access')}
            </TabsTrigger>
          )}
          {(isOwner || isAdminOrCreator) && (
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              {t('settings')}
            </TabsTrigger>
          )}
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('statistics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <InventoryItemsTab />
        </TabsContent>

        <TabsContent value="discussion" className="space-y-4">
          <Discussion inventoryId={inventoryId} />
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <AccessManagement 
            inventoryId={inventoryId} 
            isOwner={isOwner || isAdminOrCreator}
          />
        </TabsContent>

        <TabsContent value="settings">
          <InventorySettingsTab />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Statistics statistics={statistics} statsLoading={statsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const InventoryDetail = () => {
  const { id } = useParams()

  return (
    <InventoryDetailProvider inventoryId={id}>
      <InventoryDetailContent />
    </InventoryDetailProvider>
  )
}

export default InventoryDetail
