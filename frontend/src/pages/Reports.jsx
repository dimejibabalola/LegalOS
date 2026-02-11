import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Download,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { HoursChart } from '@/components/charts/HoursChart'
import { AgingChart } from '@/components/charts/AgingChart'
import { StatCard } from '@/components/common/StatCard'
import { formatCurrency } from '@/lib/utils'

const practiceAreaRevenue = [
  { name: 'Litigation', value: 450000, percentage: 45 },
  { name: 'Corporate', value: 280000, percentage: 28 },
  { name: 'IP', value: 150000, percentage: 15 },
  { name: 'Estate Planning', value: 120000, percentage: 12 },
]

const topClients = [
  { name: 'ABC Corporation', revenue: 125000 },
  { name: 'Tech Solutions Inc', revenue: 98000 },
  { name: 'XYZ Incorporated', revenue: 76000 },
  { name: 'John Smith', revenue: 45000 },
  { name: 'Jane Doe', revenue: 32000 },
]

const utilizationData = {
  target: 1800,
  actual: 1650,
  percentage: 92,
}

export function Reports() {
  const [activeTab, setActiveTab] = useState('revenue')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">Analytics and insights for your firm</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Revenue (YTD)"
          value={formatCurrency(1000000)}
          trend="up"
          trendValue="+12%"
          icon={DollarSign}
        />
        <StatCard
          title="Billable Hours"
          value="1,650"
          description="of 1,800 target"
          icon={Clock}
        />
        <StatCard
          title="Utilization Rate"
          value="92%"
          trend="up"
          trendValue="+3%"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Clients"
          value="48"
          trend="up"
          trendValue="+5"
          icon={Users}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="aging">A/R Aging</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Practice Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {practiceAreaRevenue.map((area) => (
                    <div key={area.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{area.name}</span>
                        <span className="text-sm text-slate-500">
                          {formatCurrency(area.value)} ({area.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${area.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Clients by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div key={client.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{client.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(client.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <HoursChart />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Utilization Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-600">{utilizationData.percentage}%</p>
                  <p className="text-slate-500 mt-2">Utilization Rate</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Actual Hours</span>
                    <span className="font-medium">{utilizationData.actual}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Target Hours</span>
                    <span className="font-medium">{utilizationData.target}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${utilizationData.percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          <AgingChart />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Realization Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-5xl font-bold text-green-600">87%</p>
                  <p className="text-slate-500 mt-2">Billable vs Total Hours</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-5xl font-bold text-blue-600">94%</p>
                  <p className="text-slate-500 mt-2">Collected vs Billed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
