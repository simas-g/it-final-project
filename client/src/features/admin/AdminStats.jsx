import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const AdminStats = ({ stats = {} }) => {
  const { getTranslation, language } = useI18n()
  const statCards = [
    {
      title: getTranslation('totalUsers', language),
      value: stats?.totalUsers || 0,
      icon: Users
    },
    {
      title: getTranslation('totalInventories', language),
      value: stats?.totalInventories || 0,
      icon: Shield
    },
    {
      title: getTranslation('totalItems', language),
      value: stats?.totalItems || 0,
      icon: Shield
    },
    {
      title: getTranslation('totalPosts', language),
      value: stats?.totalPosts || 0,
      icon: Shield
    }
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

