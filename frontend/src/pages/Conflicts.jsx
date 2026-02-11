import { useState } from 'react'
import { Search, CheckCircle, AlertTriangle, XCircle, History, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/lib/utils'

const sampleHistory = [
  { id: 1, name: 'John Smith', result: 'clear', date: '2024-01-15', user: 'Jane Doe' },
  { id: 2, name: 'ABC Corporation', result: 'potential', date: '2024-01-14', user: 'John Doe', details: 'Existing client: ABC Corp (M-2023-045)' },
  { id: 3, name: 'Michael Brown', result: 'clear', date: '2024-01-13', user: 'Jane Doe' },
  { id: 4, name: 'XYZ Incorporated', result: 'flagged', date: '2024-01-12', user: 'John Doe', details: 'Opposing counsel in Smith v. Jones' },
  { id: 5, name: 'Sarah Wilson', result: 'clear', date: '2024-01-11', user: 'Jane Doe' },
]

const resultConfig = {
  clear: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50',
    badge: 'bg-green-100 text-green-700',
    label: 'Clear',
    message: 'No conflicts found. Safe to proceed.',
  },
  potential: {
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Potential Conflict',
    message: 'Potential conflict detected. Review required.',
  },
  flagged: {
    icon: XCircle,
    color: 'text-red-600 bg-red-50',
    badge: 'bg-red-100 text-red-700',
    label: 'Conflict Flagged',
    message: 'Conflict of interest detected. Do not proceed.',
  },
}

export function Conflicts() {
  const [searchName, setSearchName] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)

  const handleCheck = () => {
    if (!searchName.trim()) return
    
    setChecking(true)
    setResult(null)
    
    // Simulate API call
    setTimeout(() => {
      setChecking(false)
      // Random result for demo
      const results = ['clear', 'potential', 'flagged']
      const randomResult = results[Math.floor(Math.random() * results.length)]
      setResult(randomResult)
    }, 1500)
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, item) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          {item.details && <p className="text-sm text-slate-500">{item.details}</p>}
        </div>
      ),
    },
    {
      key: 'result',
      title: 'Result',
      render: (value) => (
        <Badge className={resultConfig[value].badge}>
          {resultConfig[value].label}
        </Badge>
      ),
    },
    {
      key: 'date',
      title: 'Date',
      render: (value) => formatDate(value),
    },
    { key: 'user', title: 'Checked By' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Conflict Check</h1>
        <p className="text-slate-500">Check for conflicts of interest before taking on new matters</p>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5" />
            New Conflict Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter name to check..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
            </div>
            <Button
              onClick={handleCheck}
              disabled={checking || !searchName.trim()}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {checking ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Check
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${resultConfig[result].color}`}>
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = resultConfig[result].icon
                  return <Icon className="h-6 w-6" />
                })()}
                <div>
                  <p className="font-medium">{resultConfig[result].label}</p>
                  <p className="text-sm opacity-80">{resultConfig[result].message}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5" />
            Check History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={sampleHistory}
            emptyMessage="No conflict checks yet"
            pagination={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
