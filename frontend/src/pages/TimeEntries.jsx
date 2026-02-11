import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Clock,
  Play,
  Filter,
  Calendar,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { TimerWidget } from '@/components/common/TimerWidget'
import { formatCurrency, formatDate } from '@/lib/utils'

const sampleTimeEntries = [
  { id: 1, date: '2024-01-15', description: 'Review discovery documents', matter: 'Smith v. Jones', user: 'John Doe', hours: 2.5, rate: 350, billable: true },
  { id: 2, date: '2024-01-15', description: 'Client consultation', matter: 'Smith v. Jones', user: 'John Doe', hours: 1.0, rate: 350, billable: true },
  { id: 3, date: '2024-01-14', description: 'Draft motion to compel', matter: 'Smith v. Jones', user: 'John Doe', hours: 3.0, rate: 350, billable: true },
  { id: 4, date: '2024-01-14', description: 'Internal team meeting', matter: 'General', user: 'John Doe', hours: 0.5, rate: 0, billable: false },
  { id: 5, date: '2024-01-13', description: 'Research case law', matter: 'ABC Corp litigation', user: 'Jane Smith', hours: 2.0, rate: 400, billable: true },
  { id: 6, date: '2024-01-13', description: 'Document review', matter: 'ABC Corp litigation', user: 'Jane Smith', hours: 4.0, rate: 400, billable: true },
]

const sampleMatters = [
  { id: 1, title: 'Smith v. Jones', client: 'John Smith' },
  { id: 2, title: 'ABC Corp Contract Review', client: 'ABC Corporation' },
  { id: 3, title: 'Tech Solutions IP Filing', client: 'Tech Solutions Inc' },
]

export function TimeEntries() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'billable',
      label: 'Type',
      options: [
        { value: 'true', label: 'Billable' },
        { value: 'false', label: 'Non-Billable' },
      ],
    },
  ]

  const filteredEntries = sampleTimeEntries.filter((entry) => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.matter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBillable = !filters.billable || filters.billable === 'all' || 
      String(entry.billable) === filters.billable
    return matchesSearch && matchesBillable
  })

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0)
  const totalValue = filteredEntries
    .filter((e) => e.billable)
    .reduce((sum, entry) => sum + (entry.hours * entry.rate), 0)

  const columns = [
    {
      key: 'date',
      title: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value, entry) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{entry.matter}</p>
        </div>
      ),
    },
    { key: 'user', title: 'User' },
    { key: 'hours', title: 'Hours' },
    {
      key: 'rate',
      title: 'Rate',
      render: (value) => value > 0 ? formatCurrency(value) : '-',
    },
    {
      key: 'billable',
      title: 'Type',
      render: (value) => (
        <Badge className={value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {value ? 'Billable' : 'Non-Billable'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Entries</h1>
          <p className="text-slate-500">Track and manage billable hours</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Time Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-500">Time entry form would go here.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Billable Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">32.5h</p>
            <p className="text-xs text-slate-500">of 40h target</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Time Entries Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search time entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <FilterBar filters={filterOptions} onFilterChange={setFilters} />
          </div>

          <DataTable
            columns={columns}
            data={filteredEntries}
            emptyMessage="No time entries found"
          />
        </div>

        {/* Timer Widget */}
        <TimerWidget matters={sampleMatters} />
      </div>
    </div>
  )
}
