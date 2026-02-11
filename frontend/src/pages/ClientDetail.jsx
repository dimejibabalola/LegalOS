import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  MessageSquare,
  Activity,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/common/DataTable'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'

const sampleClient = {
  id: 1,
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '(555) 123-4567',
  address: '123 Main Street, Suite 100, New York, NY 10001',
  type: 'individual',
  status: 'active',
  company: null,
  notes: 'Long-time client. Prefers communication via email.',
  createdAt: '2023-06-15',
}

const sampleMatters = [
  { id: 1, number: 'M-2024-001', title: 'Smith v. Jones', practiceArea: 'Litigation', status: 'active', openDate: '2024-01-10' },
  { id: 2, number: 'M-2023-045', title: 'Contract Review 2023', practiceArea: 'Corporate', status: 'closed', openDate: '2023-08-20' },
]

const sampleBilling = {
  totalBilled: 125000,
  totalPaid: 98000,
  outstanding: 27000,
  lastInvoice: '2024-01-10',
}

const sampleActivities = [
  { id: 1, type: 'time_entry', description: 'Logged 2.5 hours on Smith v. Jones', date: '2024-01-15', user: 'John Doe' },
  { id: 2, type: 'invoice', description: 'Invoice #1234 sent', date: '2024-01-10', user: 'Jane Smith' },
  { id: 3, type: 'document', description: 'Contract.pdf uploaded', date: '2024-01-05', user: 'John Doe' },
]

const statusColors = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-700',
}

export function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('matters')

  const matterColumns = [
    { key: 'number', title: 'Matter #' },
    { key: 'title', title: 'Title' },
    { key: 'practiceArea', title: 'Practice Area' },
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
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/clients')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-600 text-white text-xl">
              {getInitials(sampleClient.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{sampleClient.name}</h1>
              <Badge className={sampleClient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                {sampleClient.status.charAt(0).toUpperCase() + sampleClient.status.slice(1)}
              </Badge>
            </div>
            <p className="text-slate-500">{sampleClient.type === 'individual' ? 'Individual Client' : 'Corporate Client'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium">{sampleClient.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium">{sampleClient.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium">{sampleClient.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Client Since</p>
                <p className="font-medium">{formatDate(sampleClient.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(sampleBilling.totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(sampleBilling.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(sampleBilling.outstanding)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="matters">Matters</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="matters" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Related Matters</h3>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Briefcase className="h-4 w-4" />
              New Matter
            </Button>
          </div>
          <DataTable
            columns={matterColumns}
            data={sampleMatters}
            onRowClick={(matter) => navigate(`/matters/${matter.id}`)}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Billing History</h3>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <DollarSign className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-500 py-8">Billing history would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Documents</h3>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-500 py-8">Client documents would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-4">
            {sampleActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className="mt-0.5">
                  {activity.type === 'time_entry' && <DollarSign className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'invoice' && <DollarSign className="h-4 w-4 text-green-500" />}
                  {activity.type === 'document' && <FileText className="h-4 w-4 text-slate-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{activity.description}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(activity.date)} by {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
