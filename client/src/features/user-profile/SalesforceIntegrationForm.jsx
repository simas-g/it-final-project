import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createSalesforceAccount, updateSalesforceAccount, getSalesforceData } from '@/queries/api'

const SalesforceIntegrationForm = ({ open, onOpenChange, isEditMode = false, targetUserId = null }) => {
  const { t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    industry: '',
    description: '',
    website: '',
    numberOfEmployees: '',
    jobTitle: '',
    department: ''
  })

  const { data: salesforceData, isLoading: loadingData } = useQuery({
    queryKey: ['salesforceData', targetUserId],
    queryFn: () => getSalesforceData(targetUserId),
    enabled: open && isEditMode && !!targetUserId,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })

  useEffect(() => {
    if (salesforceData && isEditMode) {
      setFormData({
        companyName: salesforceData.companyName || '',
        phone: salesforceData.phone || '',
        industry: salesforceData.industry || '',
        description: salesforceData.description || '',
        website: salesforceData.website || '',
        numberOfEmployees: salesforceData.numberOfEmployees?.toString() || '',
        jobTitle: salesforceData.jobTitle || '',
        department: salesforceData.department || ''
      })
    } else if (open && !isEditMode) {
      setFormData({
        companyName: '',
        phone: '',
        industry: '',
        description: '',
        website: '',
        numberOfEmployees: '',
        jobTitle: '',
        department: ''
      })
    }
  }, [salesforceData, isEditMode, open])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditMode) {
        const response = await updateSalesforceAccount(formData, targetUserId)
        queryClient.invalidateQueries({ queryKey: ['salesforceData'] })
        toast({
          title: t('salesforce.updateSuccessTitle') || 'Success',
          description: t('salesforce.updateSuccessMessage') || response.message || 'Salesforce account and contact updated successfully',
        })
      } else {
        const response = await createSalesforceAccount(formData, targetUserId)
        queryClient.invalidateQueries({ queryKey: ['salesforceData'] })
        queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        toast({
          title: t('salesforce.successTitle') || 'Success',
          description: t('salesforce.successMessage') || `Account and Contact created successfully in Salesforce. Account ID: ${response.data?.accountId}`,
        })
        setFormData({
          companyName: '',
          phone: '',
          industry: '',
          description: '',
          website: '',
          numberOfEmployees: '',
          jobTitle: '',
          department: ''
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: t('salesforce.errorTitle') || 'Error',
        description: error.response?.data?.error || error.message || (isEditMode ? t('salesforce.updateErrorMessage') : t('salesforce.errorMessage')) || (isEditMode ? 'Failed to update Salesforce account' : 'Failed to create Salesforce account'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] max-w-[90vw] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode 
              ? (t('salesforce.editFormTitle') || 'Edit Salesforce Account')
              : (t('salesforce.formTitle') || 'Create Salesforce Account')
            }
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? (t('salesforce.editFormDescription') || 'Update your Salesforce Account and Contact information.')
              : (t('salesforce.formDescription') || 'Fill in the additional information to create an Account with a linked Contact in Salesforce.')
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              {t('salesforce.companyName') || 'Company Name'} *
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              required
              placeholder={t('salesforce.companyNamePlaceholder') || 'Enter company name'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('salesforce.phone') || 'Phone'}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('salesforce.phonePlaceholder') || 'Enter phone number'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">
                {t('salesforce.industry') || 'Industry'}
              </Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder={t('salesforce.industryPlaceholder') || 'Enter industry'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">
                {t('salesforce.website') || 'Website'}
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder={t('salesforce.websitePlaceholder') || 'Enter website URL'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfEmployees">
                {t('salesforce.numberOfEmployees') || 'Number of Employees'}
              </Label>
              <Input
                id="numberOfEmployees"
                type="number"
                min="1"
                max="2147483647"
                value={formData.numberOfEmployees}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 2147483647)) {
                    handleInputChange('numberOfEmployees', value)
                  }
                }}
                placeholder={t('salesforce.numberOfEmployeesPlaceholder') || 'Enter number of employees'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t('salesforce.description') || 'Description'}
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('salesforce.descriptionPlaceholder') || 'Enter company description'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">
                {t('salesforce.jobTitle') || 'Job Title'}
              </Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder={t('salesforce.jobTitlePlaceholder') || 'Enter job title'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                {t('salesforce.department') || 'Department'}
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder={t('salesforce.departmentPlaceholder') || 'Enter department'}
              />
            </div>
          </div>


          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading || loadingData} className="w-full sm:w-auto">
              {loading
                ? (isEditMode 
                    ? (t('salesforce.updating') || 'Updating...')
                    : (t('salesforce.creating') || 'Creating...')
                  )
                : (isEditMode
                    ? (t('salesforce.updateAccount') || 'Update Account')
                    : (t('salesforce.createAccount') || 'Create Account')
                  )
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SalesforceIntegrationForm


