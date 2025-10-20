import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useI18n } from '@/contexts/I18nContext'
import Header from './Header'
import Sidebar from './Sidebar'
import { useState } from 'react'

export default function Layout() {
  const { isAuthenticated } = useAuth()
  const { theme, language } = useTheme()
  const { getTranslation } = useI18n()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex">
        <Sidebar 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
