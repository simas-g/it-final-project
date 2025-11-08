export const calculateStats = (owned, writeAccess) => {
  const allInventories = [...owned, ...writeAccess]
  const totalItems = allInventories.reduce((sum, inv) => sum + (inv._count?.items || 0), 0)
  const recentActivity = allInventories.filter(inv => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return new Date(inv.updatedAt) > dayAgo
  }).length
  return {
    totalInventories: allInventories.length,
    totalItems,
    recentActivity
  }
}

