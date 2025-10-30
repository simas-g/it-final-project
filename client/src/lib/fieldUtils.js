export const prepareFieldValues = (customFields, fieldValues) => {
  const preparedFields = {}
  customFields.forEach(field => {
    const value = fieldValues[field.id]
    if (field.fieldType === 'BOOLEAN' || (value !== '' && value !== null && value !== undefined)) {
      switch (field.fieldType) {
        case 'NUMERIC':
          preparedFields[field.id] = parseFloat(value) || 0
          break
        case 'BOOLEAN':
          preparedFields[field.id] = value === 'true' || value === true
          break
        default:
          preparedFields[field.id] = String(value)
      }
    }
  })
  return preparedFields
}

export const initializeFieldValues = (fields) => {
  const initialValues = {}
  fields.forEach(field => {
    initialValues[field.id] = field.fieldType === 'BOOLEAN' ? false : ''
  })
  return initialValues
}

export const validateFields = (customFields, fieldValues) => {
  for (const field of customFields) {
    if (field.isRequired && !fieldValues[field.id] && field.fieldType !== 'BOOLEAN') {
      return { isValid: false, error: `${field.title} is required` }
    }
  }
  return { isValid: true }
}

