export const hasWriteAccess = (inventory, user) => {
  if (!user || !inventory) return false
  if (user.role === 'ADMIN' || user.role === 'CREATOR' || user.id === inventory.userId) {
    return true
  }
  if (inventory.inventoryAccess && inventory.inventoryAccess.length > 0) {
    const userAccess = inventory.inventoryAccess.find(access => access.userId === user.id)
    if (userAccess && userAccess.accessType === 'WRITE') {
      return true
    }
  }

  return false
}

export const isOwner = (inventory, user) => {
  if (!user || !inventory) return false
  return user.id === inventory.userId
}

export const isAdminOrCreator = (user) => {
  if (!user) return false
  return user.role === 'ADMIN' || user.role === 'CREATOR'
}

export const hasItemWriteAccess = (item, user) => {
  if (!item || !user) return false

  if (user.role === 'ADMIN' || user.role === 'CREATOR') {
    return true
  }

  if (user.id === item.userId) {
    return true
  }

  if (item.inventory && user.id === item.inventory.userId) {
    return true
  }

  if (item.inventory && item.inventory.inventoryAccess && item.inventory.inventoryAccess.length > 0) {
    const userAccess = item.inventory.inventoryAccess.find(access => access.userId === user.id)
    if (userAccess && userAccess.accessType === 'WRITE') {
      return true
    }
  }

  return false
}

