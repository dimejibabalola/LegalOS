import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
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
import { formatDate } from '@/lib/utils'

const sampleMatters = [
  { id: 1, number: 'M-2024-001', title: 'Smith v. Jones', client: 'John Smith', practiceArea: 'Litigation', status: 'active', openDate: '2024-01-10' },
  { id: 2, number: 'M-2024-002', title: 'ABC Corp Contract Review', client: 'ABC Corporation', practiceArea: 'Corporate', status: 'active', openDate: '2024-01-12' },
  { id: 3, number: 'M-2024-003', title: 'Tech Solutions IP Filing', client: 'Tech Solutions Inc', practiceArea: 'Intellectual Property', status: 'pending', openDate: '2024-01-15' },
  { id: 4, number: 'M-2023-089', title: 'Johnson Estate Planning', client: 'Robert Johnson', practiceArea: 'Estate Planning', status: 'closed', openDate: '2023-08-20' },
  { id: 5, number: 'M-2024-004', title: 'XYZ Inc Merger', client: 'XYZ Incorporated', practiceArea: 'Corporate', status: 'active', openDate: '2024-01-18' },
  { id: 6, number: 'M-2024-005', title: 'Doe Family Trust', client: 'Jane Doe', practiceArea: 'Estate Planning', status: 'active', openDate: '2024-01-20' },
]

const statusColors = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-700',
}

export function Matters() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'practiceArea',
      label: 'Practice Area',
      options: [
        { value: 'Litigation', label: 'Litigation' },
        { value: 'Corporate', label: 'Corporate' },
        { value: 'Intellectual Property', label: 'Intellectual Property' },
        { value: 'Estate Planning', label: 'Estate Planning' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'closed', label: 'Closed' },
      ],
    },
  ]

  const filteredMatters = sampleMatters.filter((matter) => {
    const matchesSearch = matter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPracticeArea = !filters.practiceArea || filters.practiceArea === 'all' || matter.practiceArea === filters.practiceArea
    const matchesStatus = !filters.status || filters.status === 'all' || matter.status === filters.status
    return matchesSearch && matchesPracticeArea && matchesStatus
  })

  const columns = [
    { key: 'number', title: 'Matter #' },
    {
      key: 'title',
      title: 'Title',
      render: (value, matter) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{matter.practiceArea}</p>
        </div>
      ),
    },
    { key: 'client', title: 'Client' },
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
      key: 'openDate',
      title: 'Open Date',
      render: (value) => formatDate(value),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Matters</h1>
          <p className="text-slate-500">Manage your legal matters and cases</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Matter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Matter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500">Matter creation form would go here.</p>
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
              placeholder="Search matters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <FilterBar filters={filterOptions} onFilterChange={setFilters} />
      </div>

      {/* Matters Table */}
      {filteredMatters.length === 0 ? (
        <EmptyState
          title="No matters found"
          description="Get started by creating your first matter."
          actionLabel="Create Matter"
          onAction={() => {}}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredMatters}
          onRowClick={(matter) => navigate(`/matters/${matter.id}`)}
          emptyMessage="No matters found"
        />
      )}
    </div>
  )
}
