import { useState } from 'react'
import { Filter, Clock, DollarSign, FileText, CheckSquare, Users, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from '@/components/common/FilterBar'
import { formatDate } from '@/lib/utils'

const sampleActivities = [
  { id: 1, type: 'time_entry', description: 'Logged 2.5 hours on Smith v. Jones', details: 'Review discovery documents', date: '2024-01-15T10:30:00', user: 'John Doe', matter: 'Smith v. Jones' },
  { id: 2, type: 'invoice', description: 'Invoice #1234 sent to ABC Corp', details: 'Amount: $5,500.00', date: '2024-01-15T09:15:00', user: 'Jane Smith', matter: 'ABC Corp Contract Review' },
  { id: 3, type: 'task', description: 'Task completed: Review discovery', details: 'Assigned to: John Doe', date: '2024-01-14T16:45:00', user: 'John Doe', matter: 'Smith v. Jones' },
  { id: 4, type: 'client', description: 'New client added: Tech Solutions Inc', details: 'Corporate client', date: '2024-01-14T11:00:00', user: 'Admin', matter: null },
  { id: 5, type: 'document', description: 'Document uploaded: Contract.pdf', details: 'Size: 2.4 MB', date: '2024-01-13T14:20:00', user: 'Jane Smith', matter: 'ABC Corp Contract Review' },
  { id: 6, type: 'communication', description: 'Email sent to opposing counsel', details: 'Re: Discovery Response', date: '2024-01-13T10:00:00', user: 'John Doe', matter: 'Smith v. Jones' },
  { id: 7, type: 'time_entry', description: 'Logged 1.0 hours on client call', details: 'Smith case consultation', date: '2024-01-12T15:30:00', user: 'John Doe', matter: 'Smith v. Jones' },
  { id: 8, type: 'task', description: 'New task created: Draft motion', details: 'Due: 2024-01-20', date: '2024-01-12T09:00:00', user: 'Jane Smith', matter: 'Smith v. Jones' },
]

const activityIcons = {
  time_entry: Clock,
  invoice: DollarSign,
  task: CheckSquare,
  client: Users,
  document: FileText,
  communication: MessageSquare,
}

const activityColors = {
  time_entry: 'text-blue-500 bg-blue-50',
  invoice: 'text-green-500 bg-green-50',
  task: 'text-amber-500 bg-amber-50',
  client: 'text-purple-500 bg-purple-50',
  document: 'text-slate-500 bg-slate-50',
  communication: 'text-indigo-500 bg-indigo-50',
}

export function Activities() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'time_entry', label: 'Time Entry' },
        { value: 'invoice', label: 'Invoice' },
        { value: 'task', label: 'Task' },
        { value: 'client', label: 'Client' },
        { value: 'document', label: 'Document' },
        { value: 'communication', label: 'Communication' },
      ],
    },
  ]

  const filteredActivities = sampleActivities.filter((activity) => {
    const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.matter?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !filters.type || filters.type === 'all' || activity.type === filters.type
    return matchesSearch && matchesType
  })

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(dateString)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activities</h1>
        <p className="text-slate-500">Track all activities across your firm</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <FilterBar filters={filterOptions} onFilterChange={setFilters} />
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No activities found</p>
            ) : (
              filteredActivities.map((activity) => {
                const Icon = activityIcons[activity.type]
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activityColors[activity.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">{activity.description}</p>
                          <p className="text-sm text-slate-500">{activity.details}</p>
                          {activity.matter && (
                            <p className="text-sm text-blue-600 mt-1">{activity.matter}</p>
                          )}
                        </div>
                        <span className="text-sm text-slate-400 whitespace-nowrap">
                          {formatTimeAgo(activity.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">by {activity.user}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
