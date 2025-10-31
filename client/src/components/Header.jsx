import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

import { useTheme } from '@/contexts/ThemeContext'

import { useI18n } from '@/contexts/I18nContext'

import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Menu,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Globe,
  Package
} from 'lucide-react'

export default function Header({ sidebarOpen, setSidebarOpen }) {

  const { user, logout, isAuthenticated } = useAuth()

  const { theme, toggleTheme, setLanguage, language } = useTheme()

  const { t } = useI18n()

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated()) {
    return (
      <header className="sticky top-0 z-40 w-full border-b-2 bg-muted/30 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 border-2 border-foreground rounded-lg flex items-center justify-center ">
              <Package className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              InventoryManager
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline text-xs font-medium">{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')} className="cursor-pointer">
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pl')} className="cursor-pointer">
                  Polski
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">{t('login')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">{t('register')}</Link>
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-70 w-full border-b-2 bg-muted/30 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button

            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 border-2 border-foreground rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl hidden sm:inline tracking-tight">
              InventoryManager
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline text-xs font-medium">{language.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('es')} className="cursor-pointer">
                Español
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('pl')} className="cursor-pointer">
                Polski
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button

            variant="ghost"
            size="sm"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu className="">
            <DropdownMenuTrigger asChild className="border rounded-md p-2">
              <Button 

                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2"
              >
              
                <span className="hidden p-2 md:inline text-sm font-medium">
                  {user?.email}
                </span>
                <User className='inline md:hidden'></User>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={`/profile/${user?.id}`}>
                  <User className="mr-2 h-4 w-4" />
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/dashboard">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('dashboard')}
                </Link>
              </DropdownMenuItem>
              {user?.role === 'ADMIN' && (
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/admin">
                    <Package className="mr-2 h-4 w-4" />
                    {t('admin')}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}