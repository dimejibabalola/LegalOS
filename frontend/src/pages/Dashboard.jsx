import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  CheckSquare,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/common/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/hooks/useApi'
import { formatCurrency, formatDate } from '@/lib/utils'

export function Dashboard() {
  const navigate = useNavigate()
  const { data: stats, loading: statsLoading } = useApi('/dashboard/stats')
  const { data: activities, loading: activitiesLoading } = useApi('/dashboard/activities')

  const quickActions = [
    { label: 'New Client', icon: Users, href: '/clients/new', color: 'bg-blue-100 text-blue-600' },
    { label: 'Log Time', icon: Clock, href: '/billing/time/new', color: 'bg-green-100 text-green-600' },
    { label: 'Create Task', icon: CheckSquare, href: '/tasks/new', color: 'bg-amber-100 text-amber-600' },
    { label: 'New Invoice', icon: FileText, href: '/billing/invoices/new', color: 'bg-purple-100 text-purple-600' },
  ]

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const dashboardStats = stats || {
    tasksDueToday: 5,
    eventsToday: 3,
    hoursThisWeek: 32,
    hoursTarget: 40,
    draftInvoices: 8,
    draftTotal: 45000,
    unpaidInvoices: 12,
    unpaidTotal: 78000,
    overdueInvoices: 3,
    overdueTotal: 15000,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">{formatDate(new Date(), 'long')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col items-start gap-3 p-4 justify-start text-left hover:bg-slate-50"
            onClick={() => navigate(action.href)}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{action.label}</p>
              <p className="text-xs text-slate-500">Click to create</p>
            </div>
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Due Today"
          value={dashboardStats.tasksDueToday}
          description={`${dashboardStats.tasksDueToday} pending tasks`}
          icon={CheckSquare}
        />
        <StatCard
          title="Events Today"
          value={dashboardStats.eventsToday}
          description="Scheduled meetings"
          icon={CalendarIcon}
        />
        <StatCard
          title="Hours This Week"
          value={`${dashboardStats.hoursThisWeek}h`}
          description={`Target: ${dashboardStats.hoursTarget}h`}
          trend={dashboardStats.hoursThisWeek >= dashboardStats.hoursTarget ? 'up' : 'down'}
          trendValue={`${Math.round((dashboardStats.hoursThisWeek / dashboardStats.hoursTarget) * 100)}%`}
          icon={Clock}
        />
        <StatCard
          title="Realization Rate"
          value="87%"
          description="Billable vs total hours"
          trend="up"
          trendValue="+3%"
          icon={TrendingUp}
        />
      </div>

      {/* Billing Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Draft Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.draftInvoices}</div>
            <p className="text-xs text-slate-500">
              {formatCurrency(dashboardStats.draftTotal)} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Unpaid Invoices
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.unpaidInvoices}</div>
            <p className="text-xs text-slate-500">
              {formatCurrency(dashboardStats.unpaidTotal)} outstanding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Overdue Invoices
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardStats.overdueInvoices}
            </div>
            <p className="text-xs text-slate-500">
              {formatCurrency(dashboardStats.overdueTotal)} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/activities')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : activities?.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {(activities || [
                { id: 1, type: 'time_entry', description: 'Logged 2.5 hours on Smith v. Jones', time: '10 minutes ago', user: 'John Doe' },
                { id: 2, type: 'invoice', description: 'Invoice #1234 sent to ABC Corp', time: '1 hour ago', user: 'Jane Smith' },
                { id: 3, type: 'task', description: 'Task "Review discovery" completed', time: '2 hours ago', user: 'John Doe' },
                { id: 4, type: 'client', description: 'New client "Tech Solutions Inc" added', time: '3 hours ago', user: 'Admin' },
                { id: 5, type: 'document', description: 'Document "Contract v2.pdf" uploaded', time: '4 hours ago', user: 'Jane Smith' },
              ]).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5">
                    {activity.type === 'time_entry' && <Clock className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'invoice' && <DollarSign className="h-4 w-4 text-green-500" />}
                    {activity.type === 'task' && <CheckSquare className="h-4 w-4 text-amber-500" />}
                    {activity.type === 'client' && <Users className="h-4 w-4 text-purple-500" />}
                    {activity.type === 'document' && <FileText className="h-4 w-4 text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">{activity.description}</p>
                    <p className="text-xs text-slate-500">
                      {activity.time} by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
