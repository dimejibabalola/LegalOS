import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Building2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { EmptyState } from '@/components/common/EmptyState'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

const sampleClients = [
  { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', type: 'individual', status: 'active', matters: 2 },
  { id: 2, name: 'ABC Corporation', email: 'legal@abccorp.com', phone: '(555) 234-5678', type: 'corporate', status: 'active', matters: 3 },
  { id: 3, name: 'Tech Solutions Inc', email: 'contact@techsolutions.com', phone: '(555) 345-6789', type: 'corporate', status: 'active', matters: 1 },
  { id: 4, name: 'Robert Johnson', email: 'robert.j@email.com', phone: '(555) 456-7890', type: 'individual', status: 'inactive', matters: 0 },
  { id: 5, name: 'XYZ Incorporated', email: 'legal@xyz.com', phone: '(555) 567-8901', type: 'corporate', status: 'active', matters: 2 },
  { id: 6, name: 'Jane Doe', email: 'jane.doe@email.com', phone: '(555) 678-9012', type: 'individual', status: 'active', matters: 1 },
]

const typeColors = {
  individual: 'bg-blue-100 text-blue-700',
  corporate: 'bg-purple-100 text-purple-700',
}

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-700',
}

export function Clients() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'corporate', label: 'Corporate' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ]

  const filteredClients = sampleClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !filters.type || filters.type === 'all' || client.type === filters.type
    const matchesStatus = !filters.status || filters.status === 'all' || client.status === filters.status
    return matchesSearch && matchesType && matchesStatus
  })

  const columns = [
    {
      key: 'name',
      title: 'Client',
      render: (value, client) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getInitials(value)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{client.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', title: 'Phone' },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <Badge className={typeColors[value]}>
          {value === 'individual' ? 'Individual' : 'Corporate'}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge className={statusColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'matters',
      title: 'Matters',
      render: (value) => (
        <span className="font-medium">{value}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500">Manage your client relationships</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500">Client creation form would go here.</p>
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
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <FilterBar filters={filterOptions} onFilterChange={setFilters} />
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Get started by adding your first client."
          actionLabel="Add Client"
          onAction={() => {}}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredClients}
          onRowClick={(client) => navigate(`/clients/${client.id}`)}
          emptyMessage="No clients found"
        />
      )}
    </div>
  )
}
