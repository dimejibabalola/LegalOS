import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Briefcase,
  Users,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Matters', href: '/matters', icon: Briefcase },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Billing', href: '/billing', icon: DollarSign },
  { name: 'More', href: '/menu', icon: MoreHorizontal },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white lg:hidden">
      <ul className="flex items-center justify-around">
        {mobileNavigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href))
          
          return (
            <li key={item.name} className="flex-1">
              <NavLink
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <item.icon className={cn('h-5 w-5 mb-1', isActive && 'text-blue-600')} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
