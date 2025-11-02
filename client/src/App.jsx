import { Route, Routes } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'

import { ToastProvider } from '@/hooks/use-toast'

import { ThemeProvider } from '@/contexts/ThemeContext'

import { AuthProvider } from '@/contexts/AuthContext'

import { I18nProvider } from '@/contexts/I18nContext'

import Layout from '@/components/Layout'

import Home from '@/pages/Home'

import Login from '@/pages/Login'

import Register from '@/pages/Register'

import Dashboard from '@/pages/Dashboard'

import CreateInventory from '@/pages/CreateInventory'

import RequestCreatorAccess from '@/pages/RequestCreatorAccess'

import CustomIdConfig from '@/pages/CustomIdConfig'

import FieldsConfig from '@/pages/FieldsConfig'

import InventoryDetail from '@/pages/InventoryDetail'

import CreateItem from '@/pages/CreateItem'

import ItemDetail from '@/pages/ItemDetail'

import AdminPanel from '@/pages/AdminPanel'

import SearchResults from '@/pages/SearchResults'

import UserProfile from '@/pages/UserProfile'

import OAuthCallback from '@/pages/OAuthCallback'

import './App.css'

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="request-creator" element={<RequestCreatorAccess />} />
                  <Route path="inventory/new" element={<CreateInventory />} />
                  <Route path="inventory/:id" element={<InventoryDetail />} />
                  <Route path="inventory/:id/custom-id" element={<CustomIdConfig />} />
                  <Route path="inventory/:id/fields" element={<FieldsConfig />} />
                  <Route path="inventory/:id/item/new" element={<CreateItem />} />
                  <Route path="item/:id" element={<ItemDetail />} />
                  <Route path="admin" element={<AdminPanel />} />
                  <Route path="search" element={<SearchResults />} />
                  <Route path="profile/:id" element={<UserProfile />} />
                </Route>
              </Routes>
              <Toaster />
            </div>
          </ToastProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
