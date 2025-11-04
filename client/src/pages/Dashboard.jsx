import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { fetchUserInventories } from "@/queries/api";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  StatsCards,
  InventorySection,
  calculateStats,
  getInventoryColumns,
  renderInventoryCard,
  getAccessInventoryColumns,
  renderAccessInventoryCard
} from "@/features/dashboard";
import { Plus, Package } from "lucide-react";

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useI18n();

  const { data: ownedInventories = [], isLoading: ownedLoading } = useQuery({
    queryKey: ['userInventories', 'owned', user?.id],
    queryFn: () => fetchUserInventories('owned', 100),
    enabled: !!user && !authLoading,
  });

  const { data: accessInventories = [], isLoading: accessLoading } = useQuery({
    queryKey: ['userInventories', 'access', user?.id],
    queryFn: () => fetchUserInventories('access', 100),
    enabled: !!user && !authLoading,
  });

  const writeAccessInventories = accessInventories.filter(inv => 
    inv.inventoryAccess?.[0]?.accessType === 'WRITE'
  )

  const stats = calculateStats(ownedInventories, writeAccessInventories)
  const loading = ownedLoading || accessLoading

  const inventoryColumns = getInventoryColumns(t)
  const accessInventoryColumns = getAccessInventoryColumns(t)
  
  if (authLoading || loading) return <LoadingSpinner message={t('loading')} />

  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center max-w-md space-y-4">
          <Package className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">{t('loginRequired')}</h2>
          <p className="text-muted-foreground">{t('pleaseLogin')}</p>
          <Button asChild size="lg">
            <Link to="/login">{t('login')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold mb-1">{t('dashboard')}</h1>
          <p className="text-muted-foreground">
            {t('welcomeBack')}, {user?.name || user?.email.split('@')[0]}
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/inventory/new">
            <Plus className="mr-2 h-5 w-5" />
            {t('newInventory')}
          </Link>
        </Button>
      </div>
      <StatsCards stats={stats} />

      <InventorySection
        title={t('yourInventories')}
        inventories={ownedInventories}
        columns={inventoryColumns}
        renderCard={(inv) => renderInventoryCard(inv, t)}
      />

      {writeAccessInventories.length > 0 && (
        <InventorySection
          title={t('inventoriesWithWriteAccess')}
          inventories={writeAccessInventories}
          columns={accessInventoryColumns}
          renderCard={(inv) => renderAccessInventoryCard(inv, t)}
        />
      )}
    </div>
  )
}

export default Dashboard
