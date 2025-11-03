import { createContext, useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { usePagination } from '@/hooks/usePagination'
import { fetchUserProfile } from '@/queries/api'

const UserProfileContext = createContext()

export const UserProfileProvider = ({ children, userId }) => {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('inventories')
  const inventoriesPagination = usePagination(1, 12)
  const itemsPagination = usePagination(1, 10)
  const postsPagination = usePagination(1, 10)
  const likesPagination = usePagination(1, 10)

  const { data: profileUser, isLoading: loading } = useQuery({
    queryKey: [
      'userProfile', 
      userId, 
      inventoriesPagination.page, 
      inventoriesPagination.limit,
      itemsPagination.page,
      itemsPagination.limit,
      postsPagination.page,
      postsPagination.limit,
      likesPagination.page,
      likesPagination.limit
    ],
    queryFn: () => fetchUserProfile({
      id: userId,
      inventoriesPage: inventoriesPagination.page,
      inventoriesLimit: inventoriesPagination.limit,
      itemsPage: itemsPagination.page,
      itemsLimit: itemsPagination.limit,
      postsPage: postsPagination.page,
      postsLimit: postsPagination.limit,
      likesPage: likesPagination.page,
      likesLimit: likesPagination.limit
    }),
  })

  const isOwnProfile = currentUser?.id === profileUser?.id

  const value = {
    profileUser,
    loading,
    isOwnProfile,
    activeTab,
    setActiveTab,
    inventoriesPagination,
    itemsPagination,
    postsPagination,
    likesPagination,
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}

