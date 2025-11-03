import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccessManagement } from './AccessManagementContext'

export const UserAccessItem = ({ access }) => {
  const { handleRemoveAccess } = useAccessManagement()
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold">
            {(access.user.name || access.user.email).charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <Link
            to={`/profile/${access.user.id}`}
            className="font-medium hover:text-primary transition-colors"
          >
            {access.user.name || access.user.email}
          </Link>
          <p className="text-sm text-muted-foreground">{access.user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveAccess(access.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

