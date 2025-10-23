export const getColumnNameForField = (fieldType, index) => {
  const columnMap = {
    'SINGLE_LINE_TEXT': ['text1', 'text2', 'text3'],
    'MULTI_LINE_TEXT': ['multiText1', 'multiText2', 'multiText3'],
    'NUMERIC': ['numeric1', 'numeric2', 'numeric3'],
    'DOCUMENT_IMAGE': ['image1', 'image2', 'image3'],
    'BOOLEAN': ['boolean1', 'boolean2', 'boolean3']
  }
  
  return columnMap[fieldType]?.[index] || null
}

export const getFieldTypeFromColumn = (columnName) => {
  if (columnName.startsWith('text')) return 'SINGLE_LINE_TEXT'
  if (columnName.startsWith('multiText')) return 'MULTI_LINE_TEXT'
  if (columnName.startsWith('numeric')) return 'NUMERIC'
  if (columnName.startsWith('image')) return 'DOCUMENT_IMAGE'
  if (columnName.startsWith('boolean')) return 'BOOLEAN'
  return null
}

export const fieldsToColumns = (fields, inventoryFields) => {
  const columns = {}
  
  inventoryFields.forEach(field => {
    const value = fields[field.id]
    if (value !== undefined && value !== null) {
      columns[field.columnName] = value
    }
  })
  
  return columns
}

export const columnsToFields = (item, inventoryFields) => {
  const fields = {}
  
  inventoryFields.forEach(field => {
    const value = item[field.columnName]
    if (value !== undefined && value !== null) {
      fields[field.id] = value
    }
  })
  
  return fields
}

