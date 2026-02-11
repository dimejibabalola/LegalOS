import { useState } from 'react'
import { Plus, Filter, Grid3X3, List, CheckCircle2, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

const sampleTasks = [
  { id: 1, title: 'Review discovery documents', matter: 'Smith v. Jones', assignee: 'John Doe', dueDate: '2024-01-15', priority: 'high', status: 'todo' },
  { id: 2, title: 'Prepare deposition questions', matter: 'ABC Corp litigation', assignee: 'Jane Smith', dueDate: '2024-01-16', priority: 'high', status: 'in_progress' },
  { id: 3, title: 'Draft motion to dismiss', matter: 'Tech Solutions case', assignee: 'John Doe', dueDate: '2024-01-18', priority: 'medium', status: 'todo' },
  { id: 4, title: 'Client meeting preparation', matter: 'Smith v. Jones', assignee: 'Jane Smith', dueDate: '2024-01-14', priority: 'low', status: 'done' },
  { id: 5, title: 'File court documents', matter: 'ABC Corp litigation', assignee: 'John Doe', dueDate: '2024-01-17', priority: 'medium', status: 'in_progress' },
  { id: 6, title: 'Research case law', matter: 'Tech Solutions case', assignee: 'Jane Smith', dueDate: '2024-01-20', priority: 'low', status: 'todo' },
]

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

const statusColors = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
}

export function Tasks() {
  const [view, setView] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
  ]

  const filteredTasks = sampleTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.matter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !filters.status || filters.status === 'all' || task.status === filters.status
    const matchesPriority = !filters.priority || filters.priority === 'all' || task.priority === filters.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === 'todo'),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
    done: filteredTasks.filter((t) => t.status === 'done'),
  }

  const columns = [
    {
      key: 'title',
      title: 'Task',
      render: (value, task) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{task.matter}</p>
        </div>
      ),
    },
    { key: 'assignee', title: 'Assignee' },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value) => (
        <Badge variant="outline" className={priorityColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge className={statusColors[value]}>
          {value === 'in_progress' ? 'In Progress' : value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">Manage your tasks and to-dos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500">Task creation form would go here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterBar filters={filterOptions} onFilterChange={setFilters} />
          <div className="flex rounded-lg border bg-white">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
              className={view === 'list' ? 'bg-blue-600' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'board' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('board')}
              className={view === 'board' ? 'bg-blue-600' : ''}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredTasks}
          emptyMessage="No tasks found"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { key: 'todo', title: 'To Do', icon: Circle, color: 'border-slate-200' },
            { key: 'in_progress', title: 'In Progress', icon: Clock, color: 'border-blue-200' },
            { key: 'done', title: 'Done', icon: CheckCircle2, color: 'border-green-200' },
          ].map((column) => (
            <Card key={column.key} className={cn('border-t-4', column.color)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <column.icon className="h-4 w-4" />
                  <CardTitle className="text-base">{column.title}</CardTitle>
                  <Badge variant="secondary" className="ml-auto">
                    {tasksByStatus[column.key].length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksByStatus[column.key].length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No tasks</p>
                ) : (
                  tasksByStatus[column.key].map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow cursor-pointer"
                    >
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-sm text-slate-500">{task.matter}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
