import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { 
  Plus, 
  Package, 
  FileText,
  Users, 
  Calendar,
  Globe,
  Lock,
  Eye
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInventories: 0,
    totalItems: 0,
    recentActivity: 0
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchData = async () => {
      try {
        const [ownedRes, accessRes] = await Promise.all([
          api.get('/user/inventories?type=owned'),
          api.get('/user/inventories?type=access')
        ]);

        const allInventories = [...ownedRes.data, ...accessRes.data];
        setInventories(allInventories);

        const totalItems = allInventories.reduce((sum, inv) => sum + (inv._count?.items || 0), 0);
        setStats({
          totalInventories: allInventories.length,
          totalItems,
          recentActivity: allInventories.filter(inv => {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return new Date(inv.updatedAt) > dayAgo;
          }).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('inventories')}</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalInventories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('items')}</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('recentActivity')}</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recentActivity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventories List */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold">{t('yourInventories')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {inventories.length} {inventories.length === 1 ? t('inventory') : t('inventories')}
          </p>
        </div>

        {inventories.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noInventories')}</h3>
                <p className="text-muted-foreground mb-4">{t('createYourFirst')}</p>
                <Button asChild size="lg">
                  <Link to="/inventory/new">
                    <Plus className="mr-2 h-5 w-5" />
                    {t('createInventory')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {inventories.map((inventory) => (
              <Card key={inventory.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/inventory/${inventory.id}`}
                          className="text-lg font-semibold hover:underline truncate"
                        >
                          {inventory.name}
                        </Link>
                        {inventory.isPublic ? (
                          <Badge variant="secondary" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            {t('public')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            {t('private')}
                          </Badge>
                        )}
                        {inventory.userId !== user?.id && inventory.inventoryAccess?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {inventory.inventoryAccess[0].accessType === 'WRITE' ? t('writeAccess') : t('readAccess')}
                          </Badge>
                        )}
                      </div>

                      {inventory.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {inventory.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {inventory._count?.items || 0} {t('items')}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(inventory.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/inventory/${inventory.id}`}>
                        {t('view')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
