export const isOwnerOrAdmin = (resourceUserId, userId, userRole) => {
  return resourceUserId === userId || userRole === 'ADMIN'
}

