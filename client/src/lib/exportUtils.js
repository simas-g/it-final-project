import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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

export const exportToPDF = (inventory, items) => {
  const doc = new jsPDF()
  
  doc.setFontSize(16)
  doc.text(inventory.name, 14, 15)
  
  if (inventory.description) {
    doc.setFontSize(10)
    const descLines = doc.splitTextToSize(inventory.description.substring(0, 100), 180)
    doc.text(descLines[0], 14, 22)
  }
  
  doc.setFontSize(9)
  doc.text(`Owner: ${inventory.user?.name || inventory.user?.email}`, 14, 28)
  doc.text(`Total Items: ${items.length}`, 14, 33)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38)
  
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
      if (field.fieldType === 'MULTI_LINE_TEXT') {
        return String(value || '-').substring(0, 50) + (value?.length > 50 ? '...' : '')
      }
      return String(value || '-').substring(0, 30)
    }),
    item.user?.name || item.user?.email || '-',
    new Date(item.createdAt).toLocaleDateString()
  ])
  
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 45 },
  })
  
  const fileName = `${inventory.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

