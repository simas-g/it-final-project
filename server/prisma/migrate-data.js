import { PrismaClient } from "@prisma/client"
import { getColumnNameForField } from "./lib/fieldMapping.js"

const prisma = new PrismaClient()

const migrateData = async () => {
  console.log("Starting data migration...")

  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        items: true
      }
    })

    console.log(`Found ${inventories.length} inventories to migrate`)

    for (const inventory of inventories) {
      console.log(`\nMigrating inventory: ${inventory.name}`)
      
      const fieldTypeCounters = {
        'SINGLE_LINE_TEXT': 0,
        'MULTI_LINE_TEXT': 0,
        'NUMERIC': 0,
        'DOCUMENT_IMAGE': 0,
        'BOOLEAN': 0
      }

      for (const field of inventory.fields) {
        const index = fieldTypeCounters[field.fieldType]
        const columnName = getColumnNameForField(field.fieldType, index)
        
        if (!columnName) {
          console.error(`  ❌ Cannot assign column for field ${field.title} (${field.fieldType})`)
          continue
        }

        await prisma.inventoryField.update({
          where: { id: field.id },
          data: { columnName }
        })
        
        console.log(`  ✓ Assigned ${columnName} to field "${field.title}"`)
        fieldTypeCounters[field.fieldType]++
      }

      const fieldsWithColumns = await prisma.inventoryField.findMany({
        where: { inventoryId: inventory.id }
      })

      for (const item of inventory.items) {
        if (!item.fields || typeof item.fields !== 'object') {
          console.log(`  ⚠ Skipping item ${item.id} - no fields data`)
          continue
        }

        const oldFields = item.fields
        const updateData = {}

        for (const field of fieldsWithColumns) {
          const value = oldFields[field.id]
          
          if (value !== undefined && value !== null && value !== '') {
            updateData[field.columnName] = field.fieldType === 'NUMERIC' ? 
              parseFloat(value) : value
          }
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.inventoryItem.update({
            where: { id: item.id },
            data: updateData
          })
          console.log(`  ✓ Migrated item ${item.customId || item.id} with ${Object.keys(updateData).length} fields`)
        }
      }
    }

    console.log("\n✅ Data migration completed successfully!")
    console.log("\nNext steps:")
    console.log("1. Run: npx prisma migrate dev --name convert-to-fixed-columns")
    console.log("2. This will finalize the schema changes")
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()

