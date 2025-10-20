import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { Users, UserCheck, UserX, Shield, Trash2, Search } from 'lucide-react'

export default function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const { getTranslation, language } = useI18n()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInventories: 0,
    totalItems: 0,
    totalPosts: 0
  })

  useEffect(() => {
    if (!isAdmin()) return

    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats')
        ])
        setUsers(usersRes.data.users)
        setStats(statsRes.data.stats)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      await api.put(`/admin/users/${userId}/block`, { isBlocked: !isBlocked })
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: !isBlocked } : user
      ))
    } catch (error) {
      console.error('Error toggling user block:', error)
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('Error changing user role:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm(getTranslation('confirmDeleteUser', language))) return
    
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{getTranslation('loading', language)}</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getTranslation('totalUsers', language)}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getTranslation('totalInventories', language)}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInventories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getTranslation('totalItems', language)}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getTranslation('totalPosts', language)}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{getTranslation('userManagement', language)}</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={getTranslation('searchUsers', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{user.name || user.email}</h3>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'CREATOR' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                    {user.isBlocked && (
                      <Badge variant="destructive">{getTranslation('blocked', language)}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{user._count?.inventories || 0} {getTranslation('inventories', language)}</span>
                    <span>{user._count?.items || 0} {getTranslation('items', language)}</span>
                    <span>{user._count?.discussionPosts || 0} {getTranslation('posts', language)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                  >
                    {user.isBlocked ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {getTranslation('unblock', language)}
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        {getTranslation('block', language)}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
                      handleChangeRole(user.id, newRole)
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {user.role === 'ADMIN' ? getTranslation('removeAdmin', language) : getTranslation('makeAdmin', language)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
