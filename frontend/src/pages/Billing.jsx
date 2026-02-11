import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/common/StatCard'
import { TimerWidget } from '@/components/common/TimerWidget'
import { DataTable } from '@/components/common/DataTable'
import { formatCurrency, formatDate } from '@/lib/utils'

const sampleInvoices = [
  { id: 1, number: 'INV-2024-001', client: 'ABC Corporation', amount: 5500, status: 'draft', date: '2024-01-15', dueDate: '2024-02-15' },
  { id: 2, number: 'INV-2024-002', client: 'Tech Solutions Inc', amount: 3200, status: 'sent', date: '2024-01-14', dueDate: '2024-02-14' },
  { id: 3, number: 'INV-2023-089', client: 'John Smith', amount: 7800, status: 'paid', date: '2023-12-20', dueDate: '2024-01-20' },
  { id: 4, number: 'INV-2023-090', client: 'XYZ Incorporated', amount: 4500, status: 'overdue', date: '2023-12-15', dueDate: '2024-01-15' },
]

const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

const sampleMatters = [
  { id: 1, title: 'Smith v. Jones', client: 'John Smith' },
  { id: 2, title: 'ABC Corp Contract Review', client: 'ABC Corporation' },
  { id: 3, title: 'Tech Solutions IP Filing', client: 'Tech Solutions Inc' },
]

export function Billing() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalDraft: 8700,
    totalUnpaid: 45000,
    totalOverdue: 15000,
    collectedThisMonth: 32000,
  }

  const invoiceColumns = [
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
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
          <p className="text-slate-500">Manage invoices and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/billing/invoices')}
          >
            <FileText className="h-4 w-4" />
            All Invoices
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Draft Invoices"
          value={formatCurrency(stats.totalDraft)}
          description="Pending approval"
          icon={FileText}
        />
        <StatCard
          title="Unpaid Invoices"
          value={formatCurrency(stats.totalUnpaid)}
          description="Awaiting payment"
          icon={DollarSign}
        />
        <StatCard
          title="Overdue"
          value={formatCurrency(stats.totalOverdue)}
          description="Past due date"
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          title="Collected This Month"
          value={formatCurrency(stats.collectedThisMonth)}
          description="Revenue received"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => navigate('/billing/invoices')}
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={invoiceColumns}
              data={sampleInvoices}
              onRowClick={(invoice) => navigate(`/billing/invoices/${invoice.id}`)}
              pagination={false}
            />
          </CardContent>
        </Card>

        {/* Timer Widget */}
        <TimerWidget matters={sampleMatters} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 justify-start text-left"
              onClick={() => navigate('/billing/time')}
            >
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Time Entries</p>
                <p className="text-xs text-slate-500">View and log time</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 justify-start text-left"
              onClick={() => navigate('/billing/invoices')}
            >
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">All Invoices</p>
                <p className="text-xs text-slate-500">Manage invoices</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 justify-start text-left"
            >
              <DollarSign className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium">Trust Accounts</p>
                <p className="text-xs text-slate-500">View trust balances</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 justify-start text-left"
            >
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Billing Reports</p>
                <p className="text-xs text-slate-500">View analytics</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
