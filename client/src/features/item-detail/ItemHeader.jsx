import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Edit, Trash2, Save, X } from 'lucide-react'
import { useItemDetail } from './ItemDetailContext'
import { useI18n } from '@/contexts/I18nContext'

const ItemHeader = () => {
  const {
    item,
    liked,
    isAuthenticated,
    hasWriteAccess,
    isEditing,
    saving,
    handleToggleLike,
    startEditing,
    handleSaveEdit,
    cancelEditing,
    handleDelete
  } = useItemDetail()
  
  const { t } = useI18n()

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/inventory/${item.inventory.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToInventory')}
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{item.customId || item.id}</h1>
        <p className="text-muted-foreground">
          {t('fromInventory')}: {item.inventory.name}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {isAuthenticated && (
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={handleToggleLike}
          >
            <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
            {item.likes?.length || 0}
          </Button>
        )}
        {isAuthenticated && hasWriteAccess && (
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
                  {saving ? t('saving') : t('save')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('edit')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive hover:text-foreground"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('delete')}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ItemHeader

