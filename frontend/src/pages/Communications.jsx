import { useState } from 'react'
import {
  Plus,
  Search,
  Mail,
  Phone,
  Video,
  MessageSquare,
  Calendar,
  MoreVertical,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/lib/utils'

const sampleCommunications = [
  { id: 1, type: 'email', subject: 'Discovery Response', from: 'opposing@counsel.com', to: 'john@firm.com', date: '2024-01-15', matter: 'Smith v. Jones', content: 'Please find attached our responses to discovery requests.' },
  { id: 2, type: 'call', subject: 'Client Update Call', from: 'John Smith', to: 'Jane Smith', date: '2024-01-14', matter: 'Smith v. Jones', content: 'Discussed case progress and next steps with client.' },
  { id: 3, type: 'meeting', subject: 'Case Strategy Meeting', from: 'Internal', to: 'Team', date: '2024-01-13', matter: 'ABC Corp litigation', content: 'Reviewed case strategy and assigned tasks.' },
  { id: 4, type: 'email', subject: 'Settlement Offer', from: 'opposing@counsel.com', to: 'john@firm.com', date: '2024-01-12', matter: 'Smith v. Jones', content: 'We are prepared to offer $500,000 to settle this matter.' },
  { id: 5, type: 'call', subject: 'Court Clerk Follow-up', from: 'Court Clerk', to: 'John Doe', date: '2024-01-11', matter: 'Smith v. Jones', content: 'Confirmed hearing date and filing requirements.' },
]

const typeIcons = {
  email: Mail,
  call: Phone,
  meeting: Video,
  note: MessageSquare,
}

const typeColors = {
  email: 'bg-blue-100 text-blue-700',
  call: 'bg-green-100 text-green-700',
  meeting: 'bg-purple-100 text-purple-700',
  note: 'bg-slate-100 text-slate-700',
}

export function Communications() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'call', label: 'Phone Call' },
        { value: 'meeting', label: 'Meeting' },
        { value: 'note', label: 'Note' },
      ],
    },
  ]

  const filteredCommunications = sampleCommunications.filter((comm) => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.matter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !filters.type || filters.type === 'all' || comm.type === filters.type
    return matchesSearch && matchesType
  })

  const columns = [
    {
      key: 'type',
      title: 'Type',
      render: (value) => {
        const Icon = typeIcons[value]
        return (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${typeColors[value]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )
      },
    },
    {
      key: 'subject',
      title: 'Subject',
      render: (value, comm) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{comm.matter}</p>
        </div>
      ),
    },
    { key: 'from', title: 'From' },
    { key: 'to', title: 'To' },
    {
      key: 'date',
      title: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      title: '',
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communications</h1>
          <p className="text-slate-500">Log and track all communications</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Log Communication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Communication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500">Communication logging form would go here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search communications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <FilterBar filters={filterOptions} onFilterChange={setFilters} />
      </div>

      {/* Communications Table */}
      {filteredCommunications.length === 0 ? (
        <EmptyState
          title="No communications found"
          description="Start logging your communications to keep track of all interactions."
          actionLabel="Log Communication"
          onAction={() => {}}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCommunications}
          emptyMessage="No communications found"
        />
      )}
    </div>
  )
}
