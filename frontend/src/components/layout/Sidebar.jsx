import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Briefcase,
  Users,
  FileText,
  DollarSign,
  Clock,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Matters', href: '/matters', icon: Briefcase },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Activities', href: '/activities', icon: FileText },
  { name: 'Billing', href: '/billing', icon: DollarSign },
  { name: 'Time Entries', href: '/billing/time', icon: Clock },
  { name: 'Invoices', href: '/billing/invoices', icon: FileText },
  { name: 'Accounts', href: '/accounts', icon: DollarSign },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
  { name: 'Communications', href: '/communications', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Conflicts', href: '/conflicts', icon: ShieldAlert },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Scale className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-slate-900">
              Legal OS
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-blue-600')} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-slate-200 p-4">
          <p className="text-xs text-slate-500 text-center">
            Babalola Legal OS v1.0
          </p>
        </div>
      )}
    </aside>
  )
}
