import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Briefcase,
  User,
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  MessageSquare,
  StickyNote,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'

const sampleMatter = {
  id: 1,
  number: 'M-2024-001',
  title: 'Smith v. Jones',
  client: { id: 1, name: 'John Smith', email: 'john@example.com', phone: '(555) 123-4567' },
  practiceArea: 'Litigation',
  status: 'active',
  openDate: '2024-01-10',
  description: 'Personal injury case involving motor vehicle accident. Client seeking damages for medical expenses and lost wages.',
  statuteOfLimitations: '2025-01-10',
  responsibleAttorney: 'Jane Smith',
  originatingAttorney: 'John Doe',
  billingRate: 350,
}

const sampleTimeEntries = [
  { id: 1, date: '2024-01-15', description: 'Review discovery documents', hours: 2.5, rate: 350, total: 875 },
  { id: 2, date: '2024-01-14', description: 'Client consultation', hours: 1.0, rate: 350, total: 350 },
  { id: 3, date: '2024-01-13', description: 'Draft motion to compel', hours: 3.0, rate: 350, total: 1050 },
]

const sampleDocuments = [
  { id: 1, name: 'Complaint.pdf', type: 'Pleadings', size: '2.4 MB', uploadedAt: '2024-01-10', uploadedBy: 'Jane Smith' },
  { id: 2, name: 'Discovery_Request.pdf', type: 'Discovery', size: '1.8 MB', uploadedAt: '2024-01-12', uploadedBy: 'John Doe' },
  { id: 3, name: 'Medical_Records.pdf', type: 'Evidence', size: '5.2 MB', uploadedAt: '2024-01-14', uploadedBy: 'Jane Smith' },
]

const sampleTasks = [
  { id: 1, title: 'Review discovery documents', assignee: 'John Doe', dueDate: '2024-01-20', status: 'in_progress' },
  { id: 2, title: 'Prepare deposition questions', assignee: 'Jane Smith', dueDate: '2024-01-18', status: 'todo' },
  { id: 3, title: 'File motion to compel', assignee: 'John Doe', dueDate: '2024-01-16', status: 'done' },
]

const sampleCommunications = [
  { id: 1, type: 'email', subject: 'Discovery Response', from: 'opposing@counsel.com', date: '2024-01-15', content: 'Please find attached our responses to discovery requests.' },
  { id: 2, type: 'call', subject: 'Client Update Call', from: 'John Smith', date: '2024-01-14', content: 'Discussed case progress and next steps with client.' },
]

const statusColors = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-700',
}

export function MatterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate days until statute of limitations
  const solDate = new Date(sampleMatter.statuteOfLimitations)
  const today = new Date()
  const daysUntilSOL = Math.ceil((solDate - today) / (1000 * 60 * 60 * 24))

  const timeColumns = [
    { key: 'date', title: 'Date', render: (value) => formatDate(value) },
    { key: 'description', title: 'Description' },
    { key: 'hours', title: 'Hours' },
    { key: 'rate', title: 'Rate', render: (value) => formatCurrency(value) },
    { key: 'total', title: 'Total', render: (value) => formatCurrency(value) },
  ]

  const documentColumns = [
    { key: 'name', title: 'Name' },
    { key: 'type', title: 'Type' },
    { key: 'size', title: 'Size' },
    { key: 'uploadedAt', title: 'Uploaded', render: (value) => formatDate(value) },
    { key: 'uploadedBy', title: 'By' },
  ]

  const taskColumns = [
    { key: 'title', title: 'Task' },
    { key: 'assignee', title: 'Assignee' },
    { key: 'dueDate', title: 'Due Date', render: (value) => formatDate(value) },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge className={value === 'done' ? 'bg-green-100 text-green-700' : value === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}>
          {value === 'in_progress' ? 'In Progress' : value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/matters')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Matters
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{sampleMatter.title}</h1>
            <Badge className={statusColors[sampleMatter.status]}>
              {sampleMatter.status.charAt(0).toUpperCase() + sampleMatter.status.slice(1)}
            </Badge>
          </div>
          <p className="text-slate-500">{sampleMatter.number}</p>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time">Time & Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Matter Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Matter Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Client</p>
                    <p className="font-medium">{sampleMatter.client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Practice Area</p>
                    <p className="font-medium">{sampleMatter.practiceArea}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Open Date</p>
                    <p className="font-medium">{formatDate(sampleMatter.openDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Billing Rate</p>
                    <p className="font-medium">{formatCurrency(sampleMatter.billingRate)}/hr</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Responsible Attorney</p>
                    <p className="font-medium">{sampleMatter.responsibleAttorney}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Originating Attorney</p>
                    <p className="font-medium">{sampleMatter.originatingAttorney}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-slate-700">{sampleMatter.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Statute of Limitations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Statute of Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{daysUntilSOL}</p>
                  <p className="text-sm text-slate-500">days remaining</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500">Deadline</p>
                  <p className="font-medium">{formatDate(sampleMatter.statuteOfLimitations, 'long')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Related Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(sampleMatter.client.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{sampleMatter.client.name}</p>
                  <p className="text-sm text-slate-500">{sampleMatter.client.email}</p>
                  <p className="text-sm text-slate-500">{sampleMatter.client.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Time Entries</h3>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Clock className="h-4 w-4" />
              Log Time
            </Button>
          </div>
          <DataTable columns={timeColumns} data={sampleTimeEntries} />
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Billed</span>
                <span className="text-xl font-bold">{formatCurrency(2275)}</span>
              </div>
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
          <DataTable columns={documentColumns} data={sampleDocuments} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <CheckSquare className="h-4 w-4" />
              Add Task
            </Button>
          </div>
          <DataTable columns={taskColumns} data={sampleTasks} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Communications</h3>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="h-4 w-4" />
              Log Communication
            </Button>
          </div>
          <div className="space-y-4">
            {sampleCommunications.map((comm) => (
              <Card key={comm.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{comm.type.toUpperCase()}</Badge>
                        <p className="font-medium">{comm.subject}</p>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">From: {comm.from}</p>
                      <p className="text-sm text-slate-600 mt-2">{comm.content}</p>
                    </div>
                    <span className="text-sm text-slate-400">{formatDate(comm.date)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notes</h3>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <StickyNote className="h-4 w-4" />
              Add Note
            </Button>
          </div>
          <EmptyState
            title="No notes yet"
            description="Add notes to keep track of important information about this matter."
            icon={StickyNote}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
