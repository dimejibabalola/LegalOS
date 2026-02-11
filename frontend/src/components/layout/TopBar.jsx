import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Bell,
  Play,
  Pause,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useTimer } from '@/hooks/useTimer'
import { formatDuration, getInitials } from '@/lib/utils'

export function TopBar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isRunning, elapsedTime, startTimer, stopTimer } = useTimer()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications] = useState([
    { id: 1, title: 'New task assigned', time: '5 min ago', read: false },
    { id: 2, title: 'Invoice paid', time: '1 hour ago', read: false },
    { id: 3, title: 'Meeting reminder', time: '2 hours ago', read: true },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCreateNew = (type) => {
    switch (type) {
      case 'client':
        navigate('/clients/new')
        break
      case 'matter':
        navigate('/matters/new')
        break
      case 'task':
        navigate('/tasks/new')
        break
      case 'time':
        navigate('/billing/time/new')
        break
      case 'invoice':
        navigate('/billing/invoices/new')
        break
      default:
        break
    }
  }

  const toggleTimer = () => {
    if (isRunning) {
      stopTimer()
    } else {
      startTimer()
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search clients, matters, documents..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Timer */}
        <Button
          variant={isRunning ? 'default' : 'outline'}
          size="sm"
          onClick={toggleTimer}
          className={cn(
            'gap-2',
            isRunning && 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <Clock className="h-4 w-4" />
          <span className="font-mono">{formatDuration(elapsedTime)}</span>
        </Button>

        {/* Create New */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create New</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCreateNew('client')}>
              <User className="mr-2 h-4 w-4" />
              Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('matter')}>
              <Briefcase className="mr-2 h-4 w-4" />
              Matter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('task')}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('time')}>
              <Clock className="mr-2 h-4 w-4" />
              Time Entry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('invoice')}>
              <FileText className="mr-2 h-4 w-4" />
              Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-4 text-center text-sm text-slate-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3"
                >
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-slate-500">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(user?.name || 'User')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
