import { useState, useEffect, useCallback } from 'react'

import { useParams, Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

import { useI18n } from '@/contexts/I18nContext'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

import { useToast } from '@/hooks/use-toast'

import api from '@/lib/api'

import { ArrowLeft, Edit, Trash2, Heart, Calendar, User, Save, X } from 'lucide-react'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { getTranslation, language } = useI18n()
  const { toast } = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)
  const fetchItem = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await api.get(`/items/${id}`)
      setItem(response.data)
      setLiked(response.data.likes?.some(like => like.userId === user?.id) || false)
    } catch (error) {
      console.error('Error fetching item:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [id, user?.id])
  useEffect(() => {
    fetchItem(true)
  }, [fetchItem])
  const startEditing = () => {
    const initialValues = {}
    item.inventory.fields.forEach(field => {
      const existingValue = item.fields?.[field.id]
      if (field.fieldType === 'BOOLEAN') {
        initialValues[field.id] = existingValue === true || existingValue === 'true'
      } else {
        initialValues[field.id] = existingValue || ''
      }
    })
    setEditValues(initialValues)
    setIsEditing(true)
  }
  const cancelEditing = () => {
    setIsEditing(false)
    setEditValues({})
  }
  const handleFieldChange = (fieldId, value) => {
    setEditValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }
  const handleSaveEdit = async () => {
    try {
      setSaving(true)
      const preparedFields = {}
      item.inventory.fields.forEach(field => {
        const value = editValues[field.id]
        if (field.fieldType === 'BOOLEAN' || (value !== '' && value !== null && value !== undefined)) {
          switch (field.fieldType) {
            case 'NUMERIC':
              preparedFields[field.id] = parseFloat(value) || 0
              break
            case 'BOOLEAN':
              preparedFields[field.id] = value === 'true' || value === true
              break
            default:
              preparedFields[field.id] = String(value)
          }
        }
      })
      await api.put(`/items/${id}`, {
        fields: preparedFields,
        version: item.version
      })
      await fetchItem(false)
      setIsEditing(false)
      setEditValues({})
      toast({
        title: getTranslation('success', language),
        description: getTranslation('itemUpdated', language)
      })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: getTranslation('error', language),
        description: error.response?.data?.error || getTranslation('errorUpdatingItem', language),
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleLike = async () => {
    try {
      await api.post(`/items/${id}/like`)
      await fetchItem(false)
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: getTranslation('error', language),
        description: getTranslation('errorTogglingLike', language),
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm(getTranslation('confirmDeleteItem', language))) return
    try {
      await api.delete(`/items/${id}`)
      toast({
        title: getTranslation('success', language),
        description: getTranslation('itemDeleted', language)
      })
      navigate(`/inventory/${item.inventory.id}`)
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: getTranslation('error', language),
        description: error.response?.data?.error || getTranslation('errorDeletingItem', language),
        variant: 'destructive'
      })
    }
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

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getTranslation('itemNotFound', language)}</h2>
          <Button asChild>
            <Link to="/dashboard">{getTranslation('backToDashboard', language)}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/inventory/${item.inventory.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {getTranslation('backToInventory', language)}
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{item.customId || item.id}</h1>
          <p className="text-muted-foreground">
            {getTranslation('fromInventory', language)}: {item.inventory.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated() && (
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleToggleLike}
            >
              <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              {item.likes?.length || 0}
            </Button>
          )}
          {isAuthenticated() && (item.userId === user?.id || item.inventory.userId === user?.id) && (
            <>
              {isEditing ? (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? getTranslation('saving', language) : getTranslation('save', language)}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {getTranslation('cancel', language)}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    {getTranslation('edit', language)}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive hover:text-foreground"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {getTranslation('delete', language)}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {item.inventory.fields?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation('itemDetails', language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.inventory.fields.map((field) => (
                    <div key={field.id}>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {field.title}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {isEditing ? (
                        <>
                          {field.fieldType === 'SINGLE_LINE_TEXT' && (
                            <Input
                              type="text"
                              value={editValues[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              required={field.isRequired}
                              className="mt-1"
                            />
                          )}
                          {field.fieldType === 'MULTI_LINE_TEXT' && (
                            <textarea
                              value={editValues[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              required={field.isRequired}
                              className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                            />
                          )}
                          {field.fieldType === 'NUMERIC' && (
                            <Input
                              type="number"
                              step="any"
                              value={editValues[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              required={field.isRequired}
                              className="mt-1"
                            />
                          )}
                          {field.fieldType === 'IMAGE_URL' && (
                            <Input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              value={editValues[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              required={field.isRequired}
                              className="mt-1"
                            />
                          )}
                          {field.fieldType === 'BOOLEAN' && (
                            <div className="flex items-center space-x-2 mt-1">
                              <input
                                type="checkbox"
                                checked={editValues[field.id] === true || editValues[field.id] === 'true'}
                                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                                className="w-4 h-4 rounded border-2"
                              />
                              <label className="text-sm cursor-pointer">
                                {field.title}
                              </label>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mt-1">
                          {field.fieldType === 'BOOLEAN' ? (
                            <p className="text-sm">
                              {item.fields[field.id] ? getTranslation('yes', language) : getTranslation('no', language)}
                            </p>
                          ) : field.fieldType === 'IMAGE_URL' && item.fields[field.id] ? (
                            <div className="space-y-2">
                              <img 
                                src={item.fields[field.id]} 
                                alt={field.title}
                                className="max-w-full h-auto max-h-64 rounded-lg border shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <p className="text-xs text-muted-foreground break-all" style={{display: 'none'}}>
                                {item.fields[field.id]}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm">
                              {item.fields[field.id] || getTranslation('notSet', language)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                {getTranslation('likes', language)} ({item.likes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.likes && item.likes.length > 0 ? (
                <div className="space-y-2">
                  {item.likes.filter(like => like?.user && (like.user.name || like.user.email)).map((like) => (
                    <div key={like.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <Link to={`/profile/${like.user.id}`}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                          <span className="text-primary font-semibold">
                            {((like.user.name || like.user.email || '?').charAt(0).toUpperCase())}
                          </span>
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/profile/${like.user.id}`}
                          className="font-medium hover:text-primary transition-colors block truncate"
                        >
                          {like.user.name || like.user.email || 'Unknown'}
                        </Link>
                        {like.user.name && like.user.email && (
                          <p className="text-xs text-muted-foreground truncate">{like.user.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {getTranslation('noLikesYet', language)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('itemInfo', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">{getTranslation('createdBy', language)}:</span>
                <span className="ml-2">{item.user.name || item.user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">{getTranslation('createdAt', language)}:</span>
                <span className="ml-2">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('actions', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col gap-2 items-left justify-start">
              <Button variant="secondary" asChild>
                <Link to={`/inventory/${item.inventory.id}`}>
                  {getTranslation('viewInventory', language)}
                </Link>
              </Button>
              {isAuthenticated() && (item.userId === user?.id || item.inventory.userId === user?.id) && !isEditing && (
                <Button className="w-full" variant="outline" onClick={startEditing}>
                  <Edit className="h-4 w-4 mr-2" />
                  {getTranslation('editItem', language)}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
