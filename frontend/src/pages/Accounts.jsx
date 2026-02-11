import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/common/DataTable'
import { StatCard } from '@/components/common/StatCard'
import { formatCurrency, formatDate } from '@/lib/utils'

const sampleTrustAccounts = [
  { id: 1, name: 'General Trust Account', balance: 125000, client: null, type: 'operating' },
  { id: 2, name: 'Smith v. Jones - Retainer', balance: 15000, client: 'John Smith', type: 'client' },
  { id: 3, name: 'ABC Corp - Retainer', balance: 25000, client: 'ABC Corporation', type: 'client' },
]

const sampleTransactions = [
  { id: 1, date: '2024-01-15', description: 'Retainer - Smith v. Jones', account: 'General Trust Account', type: 'credit', amount: 15000 },
  { id: 2, date: '2024-01-14', description: 'Invoice payment - INV-2023-089', account: 'Operating Account', type: 'credit', amount: 7800 },
  { id: 3, date: '2024-01-13', description: 'Office expenses', account: 'Operating Account', type: 'debit', amount: 2500 },
  { id: 4, date: '2024-01-12', description: 'Retainer - ABC Corp', account: 'General Trust Account', type: 'credit', amount: 25000 },
  { id: 5, date: '2024-01-11', description: 'Staff salaries', account: 'Operating Account', type: 'debit', amount: 15000 },
]

export function Accounts() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('trust')

  const trustColumns = [
    { key: 'name', title: 'Account Name' },
    {
      key: 'client',
      title: 'Client',
      render: (value) => value || '-',
    },
    {
      key: 'balance',
      title: 'Balance',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <Badge className={value === 'operating' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
          {value === 'operating' ? 'Operating' : 'Client'}
        </Badge>
      ),
    },
  ]

  const transactionColumns = [
    {
      key: 'date',
      title: 'Date',
      render: (value) => formatDate(value),
    },
    { key: 'description', title: 'Description' },
    { key: 'account', title: 'Account' },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <div className="flex items-center gap-1">
          {value === 'credit' ? (
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          )}
          <span className={value === 'credit' ? 'text-green-600' : 'text-red-600'}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value, item) => (
        <span className={item.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
          {item.type === 'credit' ? '+' : '-'}{formatCurrency(value)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="text-slate-500">Manage trust accounts and track transactions</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Transaction
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Trust Balance"
          value={formatCurrency(165000)}
          description="All trust accounts"
          icon={Wallet}
        />
        <StatCard
          title="Operating Account"
          value={formatCurrency(45000)}
          description="Available funds"
          icon={DollarSign}
        />
        <StatCard
          title="Pending Transfers"
          value={formatCurrency(8500)}
          description="Awaiting processing"
          icon={ArrowUpRight}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="trust">Trust Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="trust" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Trust Accounts</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Account
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={trustColumns}
                data={sampleTrustAccounts}
                emptyMessage="No trust accounts found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={transactionColumns}
                data={sampleTransactions}
                emptyMessage="No transactions found"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
