import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, User, Building2, Phone, Mail } from 'lucide-react'
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

const sampleContacts = [
  { id: 1, name: 'Michael Brown', email: 'michael@example.com', phone: '(555) 111-2222', type: 'opposing_counsel', company: 'Brown Law Firm', client: 'Smith v. Jones' },
  { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '(555) 222-3333', type: 'expert_witness', company: 'Wilson Consulting', client: 'ABC Corp litigation' },
  { id: 3, name: 'David Lee', email: 'david@example.com', phone: '(555) 333-4444', type: 'court_clerk', company: 'NY Supreme Court', client: null },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '(555) 444-5555', type: 'witness', company: null, client: 'Smith v. Jones' },
  { id: 5, name: 'Robert Taylor', email: 'robert@example.com', phone: '(555) 555-6666', type: 'opposing_counsel', company: 'Taylor & Associates', client: 'Tech Solutions case' },
]

const typeColors = {
  opposing_counsel: 'bg-red-100 text-red-700',
  expert_witness: 'bg-purple-100 text-purple-700',
  court_clerk: 'bg-blue-100 text-blue-700',
  witness: 'bg-green-100 text-green-700',
  other: 'bg-slate-100 text-slate-700',
}

const typeLabels = {
  opposing_counsel: 'Opposing Counsel',
  expert_witness: 'Expert Witness',
  court_clerk: 'Court Clerk',
  witness: 'Witness',
  other: 'Other',
}

export function Contacts() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'type',
      label: 'Type',
      options: Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
    },
  ]

  const filteredContacts = sampleContacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !filters.type || filters.type === 'all' || contact.type === filters.type
    return matchesSearch && matchesType
  })

  const columns = [
    {
      key: 'name',
      title: 'Contact',
      render: (value, contact) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
              {getInitials(value)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{contact.email}</p>
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
          {typeLabels[value]}
        </Badge>
      ),
    },
    { key: 'company', title: 'Company' },
    { key: 'client', title: 'Related Matter' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500">Manage your professional contacts</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500">Contact creation form would go here.</p>
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
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <FilterBar filters={filterOptions} onFilterChange={setFilters} />
      </div>

      {/* Contacts Table */}
      {filteredContacts.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description="Get started by adding your first contact."
          actionLabel="Add Contact"
          onAction={() => {}}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredContacts}
          emptyMessage="No contacts found"
        />
      )}
    </div>
  )
}
