import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Package, FileText, Users } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const StatsCards = ({ stats }) => {
  const { t } = useI18n()

  const cards = [
    {
      label: t('inventories'),
      value: stats.totalInventories,
      icon: Package
    },
    {
      label: t('items'),
      value: stats.totalItems,
      icon: FileText
    },
    {
      label: t('recentActivity'),
      value: stats.recentActivity,
      icon: Users
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

