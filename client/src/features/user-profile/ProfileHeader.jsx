import { User, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useUserProfile } from './UserProfileContext'
import { useI18n } from '@/contexts/I18nContext'

const ProfileHeader = () => {
  const { profileUser } = useUserProfile()
  const { t } = useI18n()
  
  return (
    <div className="flex items-start gap-6 pb-6 border-b">
      <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center shrink-0">
        <User className="h-8 w-8 text-background" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{profileUser.name || profileUser.email}</h1>
          <Badge variant={profileUser.role === 'ADMIN' ? 'default' : 'outline'}>
            {profileUser.role}
          </Badge>
          {profileUser.isBlocked && (
            <Badge variant="destructive">{t('blocked')}</Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {t('joined')} {new Date(profileUser.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span>
            <strong className="font-semibold">{profileUser._count?.inventories || 0}</strong> {t('inventories')}
          </span>
          <span>
            <strong className="font-semibold">{profileUser._count?.items || 0}</strong> {t('items')}
          </span>
          <span>
            <strong className="font-semibold">{profileUser._count?.discussionPosts || 0}</strong> {t('posts')}
          </span>
          <span>
            <strong className="font-semibold">{profileUser._count?.itemLikes || 0}</strong> {t('likes')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader

