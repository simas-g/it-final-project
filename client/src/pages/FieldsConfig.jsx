import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import api from "@/lib/api"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { ArrowLeft, AlertCircle, Info } from "lucide-react"
import FieldsList from "@/components/fields-config/FieldsList"
import FieldTypeButtons from "@/components/fields-config/FieldTypeButtons"
import FixedFieldsInfo from "@/components/fields-config/FixedFieldsInfo"
import { FIELD_TYPES } from "@/lib/inventoryConstants"
import { fetchInventoryFields } from "@/queries/api"

const FieldsConfig = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fields, setFields] = useState([])
  const { isLoading, refetch } = useQuery({
    queryKey: ['inventoryFields', id],
    queryFn: async () => {
      const data = await fetchInventoryFields(id)
      setFields(data)
      return data
    },
    enabled: !!id
  })
  const canAddFieldType = (fieldType) => {
    const typeInfo = FIELD_TYPES.find(t => t.value === fieldType)
    const count = fields.filter(f => f.fieldType === fieldType).length
    return count < typeInfo.max
  }

  const handleAddField = (fieldType) => {
    if (!canAddFieldType(fieldType)) return
    const newField = {
      title: '',
      description: '',
      fieldType,
      isRequired: false,
      showInTable: true,
      order: fields.length,
      isNew: true,
      tempId: `temp-${Date.now()}`
    }
    setFields([...fields, newField])
  }

  const handleRemoveField = async (index) => {
    const field = fields[index]
    if (field.isNew) {
      setFields(fields.filter((_, i) => i !== index))
    } else {
      try {
        await api.delete(`/fields/${field.id}`)
        setFields(fields.filter((_, i) => i !== index))
        setSuccess('Field deleted successfully')
        setTimeout(() => setSuccess(""), 3000)
      } catch (error) {
        console.error('Error deleting field:', error)
        setError(error.response?.data?.error || 'Failed to delete field')
      }
    }
  }

  const handleUpdateField = (index, fieldName, value) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], [fieldName]: value }
    setFields(updated)
  }

  const handleSave = async () => {
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].title.trim()) {
        setError(`Field ${i + 1}: Title is required`)
        return
      }
    }
    try {
      setSaving(true)
      setError("")
      const newFields = fields.filter(f => f.isNew)
      for (const field of newFields) {
        await api.post(`/inventories/${id}/fields`, {
          title: field.title,
          description: field.description,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          showInTable: field.showInTable
        })
      }
      const existingFields = fields.filter(f => !f.isNew)
      for (const field of existingFields) {
        await api.put(`/fields/${field.id}`, {
          title: field.title,
          description: field.description,
          isRequired: field.isRequired,
          showInTable: field.showInTable
        })
      }
      const fieldOrders = fields.map((field, index) => ({
        fieldId: field.id || field.tempId,
        order: index
      })).filter(fo => !fo.fieldId.startsWith('temp-'))
      if (fieldOrders.length > 0) {
        await api.put(`/inventories/${id}/fields/reorder`, { fieldOrders })
      }
      setSuccess('Fields configuration saved successfully!')
      setTimeout(() => {
        setSuccess("")
        refetch()
      }, 1500)
    } catch (error) {
      console.error('Error saving fields:', error)
      setError(error.response?.data?.error || 'Failed to save fields')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading fields..." />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button onClick={() => navigate(`/inventory/${id}`)} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <h1 className="text-3xl font-bold">Custom Fields Configuration</h1>
        <div className="w-32"></div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <Alert className="flex items-center gap-2 ">
        <Info className="h-4 w-4 flex-shrink-0" />
        <AlertDescription>
          <strong>Field Limits:</strong> You can add up to 3 fields of each type. Fixed fields (Created By, Created At, Custom ID) are automatically included in all items.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FieldsList
            fields={fields}
            setFields={setFields}
            onUpdate={handleUpdateField}
            onRemove={handleRemoveField}
            onSave={handleSave}
            saving={saving}
          />
        </div>

        <div className="space-y-4">
          <FieldTypeButtons
            fields={fields}
            onAddField={handleAddField}
          />
          <FixedFieldsInfo />
        </div>
      </div>
    </div>
  )
}

export default FieldsConfig
