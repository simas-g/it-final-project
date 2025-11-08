import { useParams, Link } from 'react-router-dom'
import { useI18n } from '@/contexts/I18nContext'
import {
  UserProfileProvider,
  useUserProfile,
  ProfileHeader,
  InventoriesTab,
  ItemsTab,
  PostsTab,
  LikesTab
} from '@/features/user-profile'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, FileText, MessageSquare, Heart } from 'lucide-react'
import LoadingSpinner from '@/components/ui/loading-spinner'

const UserProfileContent = () => {
  const { profileUser, loading, activeTab, setActiveTab } = useUserProfile()
  const { t } = useI18n()
  if (loading) return <LoadingSpinner message={t('loading')} />
  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('userNotFound')}</h2>
          <Button asChild>
            <Link to="/dashboard">{t('backToDashboard')}</Link>
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ProfileHeader />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventories" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            {t('inventories')} ({profileUser._count?.inventories || 0})
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {t('items')} ({profileUser._count?.items || 0})
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('posts')} ({profileUser._count?.discussionPosts || 0})
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            {t('likes')} ({profileUser._count?.itemLikes || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventories">
          <InventoriesTab />
        </TabsContent>
        <TabsContent value="items">
          <ItemsTab />
        </TabsContent>
        <TabsContent value="posts">
          <PostsTab />
        </TabsContent>
        <TabsContent value="likes">
          <LikesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const UserProfile = () => {
  const { id } = useParams()
  return (
    <UserProfileProvider userId={id}>
      <UserProfileContent />
    </UserProfileProvider>
  )
}

export default UserProfile
