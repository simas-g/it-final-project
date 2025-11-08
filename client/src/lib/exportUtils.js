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
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Items')
  const fileName = `${inventory.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  XLSX.writeFile(workbook, fileName, { bookType: 'csv' })
}

