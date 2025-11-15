import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Building2, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react'
import { createSalesforceAccount } from '@/queries/api'
import LoadingSpinner from '@/components/ui/loading-spinner'

const SalesforceIntegrationForm = ({ open, onOpenChange }) => {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    industry: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: '',
    jobTitle: '',
    department: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await createSalesforceAccount(formData)
      toast({
        title: t('salesforce.successTitle') || 'Success',
        description: t('salesforce.successMessage') || `Account and Contact created successfully in Salesforce. Account ID: ${response.data.accountId}`,
      })
      onOpenChange(false)
      setFormData({
        companyName: '',
        phone: '',
        industry: '',
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingPostalCode: '',
        billingCountry: '',
        jobTitle: '',
        department: ''
      })
    } catch (error) {
      toast({
        title: t('salesforce.errorTitle') || 'Error',
        description: error.response?.data?.error || error.message || t('salesforce.errorMessage') || 'Failed to create Salesforce account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('salesforce.formTitle') || 'Create Salesforce Account'}
          </DialogTitle>
          <DialogDescription>
            {t('salesforce.formDescription') || 'Fill in the additional information to create an Account with a linked Contact in Salesforce.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
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
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="flex items-center gap-2">
                <User className="h-4 w-4" />
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
              <Label htmlFor="department" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
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

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('salesforce.billingAddress') || 'Billing Address'}
            </Label>
            <div className="space-y-2">
              <Input
                value={formData.billingStreet}
                onChange={(e) => handleInputChange('billingStreet', e.target.value)}
                placeholder={t('salesforce.streetPlaceholder') || 'Street'}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={formData.billingCity}
                  onChange={(e) => handleInputChange('billingCity', e.target.value)}
                  placeholder={t('salesforce.cityPlaceholder') || 'City'}
                />
                <Input
                  value={formData.billingState}
                  onChange={(e) => handleInputChange('billingState', e.target.value)}
                  placeholder={t('salesforce.statePlaceholder') || 'State'}
                />
                <Input
                  value={formData.billingPostalCode}
                  onChange={(e) => handleInputChange('billingPostalCode', e.target.value)}
                  placeholder={t('salesforce.postalCodePlaceholder') || 'Postal Code'}
                />
              </div>
              <Input
                value={formData.billingCountry}
                onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                placeholder={t('salesforce.countryPlaceholder') || 'Country'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {t('salesforce.creating') || 'Creating...'}
                </>
              ) : (
                t('salesforce.createAccount') || 'Create Account'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SalesforceIntegrationForm


