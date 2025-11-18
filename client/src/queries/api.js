import api from '@/lib/api'

export const loginUser = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const registerUser = async ({ email, password, name }) => {
  const response = await api.post('/auth/register', { email, password, name })
  return response.data
}

export const fetchInventory = async (id) => {
  const response = await api.get(`/inventories/${id}?includeItems=false`)
  return response.data
}

export const fetchInventoryItems = async ({ inventoryId, page = 1, limit = 20 }) => {
  const response = await api.get(`/inventories/${inventoryId}/items?page=${page}&limit=${limit}`)
  return response.data
}

export const fetchInventoryStatistics = async (id) => {
  const response = await api.get(`/inventories/${id}/statistics`)
  return response.data
}

export const fetchUserInventories = async (type = 'owned', limit = 100) => {
  const response = await api.get(`/user/inventories?type=${type}&limit=${limit}`)
  return response.data.inventories || response.data
}

export const fetchItem = async (id) => {
  const response = await api.get(`/items/${id}`)
  return response.data
}

export const fetchDiscussionPosts = async (inventoryId) => {
  const response = await api.get(`/inventories/${inventoryId}/discussion`)
  return response.data.posts || []
}

export const fetchSearchResults = async ({ query, type = 'all', page = 1, limit = 20 }) => {
  const response = await api.get(`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}&limit=${limit}`)
  return response.data
}

export const fetchTagSearchResults = async ({ tag, page = 1, limit = 20 }) => {
  const response = await api.get(`/search/tag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`)
  return response.data
}

export const fetchSearchSuggestions = async (query) => {
  const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`)
  return response.data.suggestions || []
}

export const fetchAdminUserSuggestions = async (query, limit = 10) => {
  const response = await api.get(`/search/admin-users?q=${encodeURIComponent(query)}&limit=${limit}`)
  return response.data.suggestions || []
}

export const fetchHomeData = async () => {
  const [inventoriesRes, popularRes, tagsRes] = await Promise.all([
    api.get('/inventories?limit=5'),
    api.get('/inventories/popular'),
    api.get('/tags')
  ])
  
  return {
    latestInventories: inventoriesRes.data.inventories,
    popularInventories: popularRes.data,
    tags: tagsRes.data.slice(0, 30)
  }
}

export const fetchUserProfile = async ({ 
  id, 
  inventoriesPage = 1, 
  inventoriesLimit = 12,
  itemsPage = 1,
  itemsLimit = 10,
  postsPage = 1,
  postsLimit = 10,
  likesPage = 1,
  likesLimit = 10
}) => {
  const response = await api.get(
    `/users/${id}?inventoriesPage=${inventoriesPage}&inventoriesLimit=${inventoriesLimit}&itemsPage=${itemsPage}&itemsLimit=${itemsLimit}&postsPage=${postsPage}&postsLimit=${postsLimit}&likesPage=${likesPage}&likesLimit=${likesLimit}`
  )
  return response.data
}

export const fetchAdminUsers = async ({ page = 1, limit = 20, search = '' }) => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`)
  return response.data
}

export const fetchAdminStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data.stats
}

export const fetchInventoryAccessList = async (inventoryId) => {
  const response = await api.get(`/inventories/${inventoryId}/access`)
  return response.data
}

export const searchUsers = async (query) => {
  const response = await api.get(`/access/search-users?q=${encodeURIComponent(query)}`)
  return response.data.users || []
}

export const fetchCategories = async () => {
  const response = await api.get('/categories')
  return response.data
}

export const fetchInventoryFields = async (inventoryId) => {
  const response = await api.get(`/inventories/${inventoryId}/fields`)
  return response.data
}

export const getSalesforceData = async (userId = null) => {
  const url = userId ? `/salesforce/data?userId=${userId}` : '/salesforce/data'
  const response = await api.get(url)
  return response.data
}

export const createSalesforceAccount = async (formData, userId = null) => {
  const payload = userId ? { ...formData, userId } : formData
  const response = await api.post('/salesforce/create-account', payload)
  return response
}

export const updateSalesforceAccount = async (formData, userId = null) => {
  const payload = userId ? { ...formData, userId } : formData
  const response = await api.put('/salesforce/update-account', payload)
  return response.data
}

export const generateInventoryApiToken = async (inventoryId) => {
  const response = await api.post(`/inventories/${inventoryId}/api-token`)
  return response.data
}