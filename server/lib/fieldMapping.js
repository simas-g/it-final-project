export const getFieldValue = (item, fieldId) => {
  if (!item.fieldValues || !Array.isArray(item.fieldValues)) {
    return null
  }
  const fieldValue = item.fieldValues.find(fv => fv.fieldId === fieldId)
  return fieldValue ? fieldValue.value : null
}

export const getFieldValues = (item, inventoryFields) => {
  const fieldValues = {}
  if (!item.fieldValues || !Array.isArray(item.fieldValues)) {
    return fieldValues
  }
  inventoryFields.forEach(field => {
    const fieldValue = item.fieldValues.find(fv => fv.fieldId === field.id)
    if (fieldValue && fieldValue.value !== null && fieldValue.value !== undefined) {
      if (field.fieldType === 'BOOLEAN') {
        fieldValues[field.id] = fieldValue.value === 'true' || fieldValue.value === true
      } else if (field.fieldType === 'NUMERIC') {
        fieldValues[field.id] = parseFloat(fieldValue.value)
      } else {
        fieldValues[field.id] = fieldValue.value
      }
    }
  })
  return fieldValues
}

export const createFieldValueData = (fieldValues, inventoryFields) => {
  const fieldValueData = []
  Object.entries(fieldValues).forEach(([key, value]) => {
    const field = inventoryFields.find(f => f.id === key || f.title === key)
    if (field) {
      const { isValid, value: validatedValue } = validateFieldValue(value, field.fieldType)
      if (isValid) {
        fieldValueData.push({
          fieldId: field.id,
          value: String(validatedValue)
        })
      }
    }
  })
  return fieldValueData
}

export const validateFieldValue = (value, fieldType) => {
  if (fieldType === 'BOOLEAN') {
    if (value === null || value === undefined || value === '') {
      return { isValid: true, value: false }
    }
    return { isValid: true, value: Boolean(value) }
  }
  if (value === null || value === undefined || value === '') {
    return { isValid: true, value: null }
  }
  switch (fieldType) {
    case 'NUMERIC':
      const numValue = parseFloat(value)
      return { isValid: !isNaN(numValue), value: isNaN(numValue) ? null : numValue }
    case 'SINGLE_LINE_TEXT':
    case 'MULTI_LINE_TEXT':
    case 'IMAGE_URL':
      return { isValid: true, value: String(value) }
    default:
      return { isValid: true, value }
  }
}

export const formatFieldValueForDisplay = (value, fieldType) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  switch (fieldType) {
    case 'BOOLEAN':
      return Boolean(value) ? 'Yes' : 'No'
    case 'NUMERIC':
      return parseFloat(value).toLocaleString()
    default:
      return String(value)
  }
}

