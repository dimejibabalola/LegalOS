import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, FileText } from 'lucide-react'
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
import { formatCurrency, formatDate } from '@/lib/utils'

const sampleInvoices = [
  { id: 1, number: 'INV-2024-001', client: 'ABC Corporation', amount: 5500, status: 'draft', date: '2024-01-15', dueDate: '2024-02-15' },
  { id: 2, number: 'INV-2024-002', client: 'Tech Solutions Inc', amount: 3200, status: 'sent', date: '2024-01-14', dueDate: '2024-02-14' },
  { id: 3, number: 'INV-2024-003', client: 'XYZ Incorporated', amount: 7800, status: 'sent', date: '2024-01-12', dueDate: '2024-02-12' },
  { id: 4, number: 'INV-2023-089', client: 'John Smith', amount: 4500, status: 'paid', date: '2023-12-20', dueDate: '2024-01-20' },
  { id: 5, number: 'INV-2023-090', client: 'XYZ Incorporated', amount: 6200, status: 'overdue', date: '2023-12-15', dueDate: '2024-01-15' },
  { id: 6, number: 'INV-2023-091', client: 'ABC Corporation', amount: 3800, status: 'overdue', date: '2023-12-10', dueDate: '2024-01-10' },
]

const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export function Invoices() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
      ],
    },
  ]

  const filteredInvoices = sampleInvoices.filter((invoice) => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !filters.status || filters.status === 'all' || invoice.status === filters.status
    return matchesSearch && matchesStatus
  })

  const columns = [
    { key: 'number', title: 'Invoice #' },
    { key: 'client', title: 'Client' },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => formatCurrency(value),
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
      key: 'date',
      title: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value) => formatDate(value),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Manage and track all invoices</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500">Invoice creation form would go here.</p>
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
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <FilterBar filters={filterOptions} onFilterChange={setFilters} />
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Get started by creating your first invoice."
          actionLabel="Create Invoice"
          onAction={() => {}}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredInvoices}
          onRowClick={(invoice) => navigate(`/billing/invoices/${invoice.id}`)}
          emptyMessage="No invoices found"
        />
      )}
    </div>
  )
}
