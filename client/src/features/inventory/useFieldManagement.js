import { FIELD_TYPES } from '@/lib/inventoryConstants'

export const useFieldManagement = (customFields) => {
  const getFieldTypeCount = (fieldType) => {
    return customFields.filter(f => f.fieldType === fieldType).length
  }

  const canAddFieldType = (fieldType) => {
    const typeInfo = FIELD_TYPES.find(t => t.value === fieldType)
    return getFieldTypeCount(fieldType) < typeInfo.max
  }

  return {
    getFieldTypeCount,
    canAddFieldType
  }
}

