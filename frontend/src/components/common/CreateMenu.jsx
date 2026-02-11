import { useNavigate } from 'react-router-dom'
import { Plus, User, Briefcase, CheckSquare, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const createOptions = [
  {
    label: 'Client',
    icon: User,
    href: '/clients/new',
    description: 'Add a new client',
  },
  {
    label: 'Matter',
    icon: Briefcase,
    href: '/matters/new',
    description: 'Create a new matter',
  },
  {
    label: 'Task',
    icon: CheckSquare,
    href: '/tasks/new',
    description: 'Add a new task',
  },
  {
    label: 'Time Entry',
    icon: Clock,
    href: '/billing/time/new',
    description: 'Log billable time',
  },
  {
    label: 'Invoice',
    icon: FileText,
    href: '/billing/invoices/new',
    description: 'Create an invoice',
  },
]

export function CreateMenu({ variant = 'default' }) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          variant={variant}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create New</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {createOptions.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onClick={() => navigate(option.href)}
            className="flex items-start gap-3 py-3"
          >
            <div className="mt-0.5">
              <option.icon className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="font-medium">{option.label}</p>
              <p className="text-xs text-slate-500">{option.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
