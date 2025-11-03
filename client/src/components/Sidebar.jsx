import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

import { useI18n } from '@/contexts/I18nContext'

import { useTheme } from '@/contexts/ThemeContext'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'
import {
  Home,
  LayoutDashboard,
  Search,
  Users,
  Plus,
  Package,
  User  
} from 'lucide-react'

const Sidebar = ({ open, onClose }) => {

  const { user, isAdmin } = useAuth()

  const { t } = useI18n()

  const { theme } = useTheme()

  const location = useLocation()

  const navigation = [
    {
      name: t('profile'),
      href: `/profile/${user.id}`,
      icon: User,
      current: location.pathname === `/profile/${user.id}`
    },
    {
      name: t('home'),
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    },
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard'
    },
    {
      name: t('search'),
      href: '/search',
      icon: Search,
      current: location.pathname === '/search'
    }
  ]

  if (isAdmin()) {
    navigation.push({
      name: t('admin'),
      href: '/admin',
      icon: Users,
      current: location.pathname === '/admin'
    })
  }

  return (
    <>
      {open && (
        <div 
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            theme === 'light' ? "bg-white/80" : "bg-black/80"
          )}
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 w-64 h-screen pt-20 z-50 transform bg-background border-r-2 transition-transform duration-200 ease-in-out lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col overflow-hidden">
          <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150",
                    item.current
                      ? "bg-secondary text-secondary-foreground border-2"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

        </div>
      </div>
    </>
  )
}

export default Sidebar