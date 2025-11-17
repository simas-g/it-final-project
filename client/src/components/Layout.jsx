import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'
import LoadingSpinner from './ui/loading-spinner'
import SupportTicketLink from './SupportTicketLink'

const Layout = () => {
  const { isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  if (loading) return <LoadingSpinner />
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="p-8 md:p-10">
          <Outlet />
          <div className="mt-8 pt-4 border-t text-center">
            <SupportTicketLink />
          </div>
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
            <div className="mt-8 pt-4 border-t text-center">
              <SupportTicketLink />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
