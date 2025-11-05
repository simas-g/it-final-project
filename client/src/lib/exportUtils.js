import * as XLSX from 'xlsx'

export const exportToExcel = (inventory, items) => {
  const fields = inventory.fields?.filter(f => f.showInTable) || []
  
  const headers = [
    'Custom ID',
    ...fields.map(f => f.title),
    'Created By',
    'Created At'
  ]
  
  const data = items.map(item => [
    item.customId || item.id.substring(0, 8),
    ...fields.map(field => {
      const value = item.fields?.[field.id]
      if (field.fieldType === 'BOOLEAN') {
        return value === true ? 'Yes' : value === false ? 'No' : '-'
      }
      return value || '-'
    }),
    item.user?.name || item.user?.email || '-',
    new Date(item.createdAt).toLocaleDateString()
  ])
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => String(row[i] || '').length)
    )
    return { wch: Math.min(maxLength + 2, 50) }
  })
  worksheet['!cols'] = colWidths
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Items')
  
  const fileName = `${inventory.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

export const exportToCSV = (inventory, items) => {
  const fields = inventory.fields?.filter(f => f.showInTable) || []
  
  const headers = [
    'Custom ID',
    ...fields.map(f => f.title),
    'Created By',
    'Created At'
  ]
  
  const data = items.map(item => [
    item.customId || item.id.substring(0, 8),
    ...fields.map(field => {
      const value = item.fields?.[field.id]
      if (field.fieldType === 'BOOLEAN') {
        return value === true ? 'Yes' : value === false ? 'No' : '-'
      }
      return value || '-'
    }),
    item.user?.name || item.user?.email || '-',
    new Date(item.createdAt).toLocaleDateString()
  ])
  
  const escapeCSV = (value) => {
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }
  
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...data.map(row => row.map(escapeCSV).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  const fileName = `${inventory.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

