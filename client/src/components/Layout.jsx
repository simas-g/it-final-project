import { Outlet } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

import Header from './Header'

import Sidebar from './Sidebar'

import { useState } from 'react'

export default function Layout() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="p-8 md:p-10">
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
