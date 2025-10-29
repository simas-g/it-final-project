import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { Users, Search, Plus, Trash2, Globe, Lock, UserPlus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function AccessManagement({ inventoryId, isOwner }) {
  const { t } = useI18n()
  const { toast } = useToast()
  const [accessList, setAccessList] = useState([])
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    fetchAccessList()
  }, [inventoryId])
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers()
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])
  const fetchAccessList = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/inventories/${inventoryId}/access`)
      setAccessList(response.data.accessList || [])
      setIsPublic(response.data.isPublic)
    } catch (error) {
      console.error('Error fetching access list:', error)
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorFetchingAccess'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  const searchUsers = async () => {
    try {
      setSearching(true)
      const response = await api.get(`/access/search-users?q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(response.data.users || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearching(false)
    }
  }
  const handleAddAccess = async () => {
    if (!selectedUser) {
      console.log('No user selected')
      return
    }
    console.log('Adding access for:', { inventoryId, userId: selectedUser.id })
    try {
      setSubmitting(true)
      const response = await api.post(`/inventories/${inventoryId}/access`, {
        userId: selectedUser.id,
        accessType: 'WRITE'
      })
      console.log('Access granted successfully:', response.data)
      setAccessList([...accessList, response.data])
      setShowAddUser(false)
      setSearchQuery('')
      setSelectedUser(null)
      setSearchResults([])
      toast({
        title: t('success'),
        description: t('accessGranted')
      })
    } catch (error) {
      console.error('Error adding access:', error)
      console.error('Error response:', error.response?.data)
      toast({
        title: t('error'),
        description: error.response?.data?.error || error.response?.data?.details || t('errorAddingAccess'),
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }
  const handleRemoveAccess = async (accessId) => {
    if (!confirm(t('confirmRemoveAccess'))) return
    try {
      await api.delete(`/access/${accessId}`)
      setAccessList(accessList.filter(a => a.id !== accessId))
      toast({
        title: t('success'),
        description: t('accessRemoved')
      })
    } catch (error) {
      console.error('Error removing access:', error)
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorRemovingAccess'),
        variant: 'destructive'
      })
    }
  }
  const handleTogglePublic = async () => {
    try {
      const response = await api.put(`/inventories/${inventoryId}/public`, {
        isPublic: !isPublic
      })
      setIsPublic(response.data.isPublic)
      toast({
        title: t('success'),
        description: response.data.isPublic ? t('inventoryNowPublic') : t('inventoryNowPrivate')
      })
    } catch (error) {
      console.error('Error toggling public access:', error)
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('errorTogglingPublic'),
        variant: 'destructive'
      })
    }
  }
  const cancelAddUser = () => {
    setShowAddUser(false)
    setSearchQuery('')
    setSelectedUser(null)
    setSearchResults([])
  }
  if (!isOwner) {
    return null
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {isPublic ? <Globe className="h-5 w-5 mr-2" /> : <Lock className="h-5 w-5 mr-2" />}
            {t('publicAccess')}
          </CardTitle>
          <CardDescription>
            {isPublic ? t('publicAccessDescription') : t('privateAccessDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant={isPublic ? 'default' : 'secondary'}>
                  {isPublic ? t('public') : t('private')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {isPublic ? t('anyoneCanView') : t('onlySharedUsers')}
                </span>
              </div>
            </div>
            <Button
              variant={isPublic ? 'outline' : 'default'}
              onClick={handleTogglePublic}
            >
              {isPublic ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {t('makePrivate')}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  {t('makePublic')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
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
              <Button onClick={() => setShowAddUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('addUser')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddUser && (
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
                            setSearchResults([])
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
          )}
          {accessList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('noSharedUsers')}
              </h3>
              <p className="text-muted-foreground">
                {t('noSharedUsersDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {accessList.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {(access.user.name || access.user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Link
                        to={`/profile/${access.user.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {access.user.name || access.user.email}
                      </Link>
                      <p className="text-sm text-muted-foreground">{access.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccess(access.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}