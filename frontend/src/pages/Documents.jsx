import { useState } from 'react'
import {
  Folder,
  FileText,
  Image,
  FileSpreadsheet,
  MoreVertical,
  Upload,
  Search,
  Grid3X3,
  List,
  Download,
  Trash2,
  Share,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/lib/utils'

const sampleFolders = [
  { id: 1, name: 'All Documents', count: 156 },
  { id: 2, name: 'Pleadings', count: 45 },
  { id: 3, name: 'Discovery', count: 67 },
  { id: 4, name: 'Contracts', count: 23 },
  { id: 5, name: 'Correspondence', count: 34 },
  { id: 6, name: 'Evidence', count: 12 },
]

const sampleDocuments = [
  { id: 1, name: 'Complaint.pdf', folder: 'Pleadings', type: 'pdf', size: '2.4 MB', uploadedAt: '2024-01-15', uploadedBy: 'John Doe', matter: 'Smith v. Jones' },
  { id: 2, name: 'Discovery_Request.pdf', folder: 'Discovery', type: 'pdf', size: '1.8 MB', uploadedAt: '2024-01-14', uploadedBy: 'Jane Smith', matter: 'Smith v. Jones' },
  { id: 3, name: 'Medical_Records.pdf', folder: 'Evidence', type: 'pdf', size: '5.2 MB', uploadedAt: '2024-01-13', uploadedBy: 'John Doe', matter: 'Smith v. Jones' },
  { id: 4, name: 'Contract_Draft.docx', folder: 'Contracts', type: 'doc', size: '856 KB', uploadedAt: '2024-01-12', uploadedBy: 'Jane Smith', matter: 'ABC Corp Contract Review' },
  { id: 5, name: 'Settlement_Offer.pdf', folder: 'Correspondence', type: 'pdf', size: '1.2 MB', uploadedAt: '2024-01-11', uploadedBy: 'John Doe', matter: 'Smith v. Jones' },
  { id: 6, name: 'Photo_Evidence.jpg', folder: 'Evidence', type: 'image', size: '3.1 MB', uploadedAt: '2024-01-10', uploadedBy: 'Jane Smith', matter: 'Smith v. Jones' },
]

const fileIcons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  image: Image,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
}

const fileColors = {
  pdf: 'text-red-500',
  doc: 'text-blue-500',
  docx: 'text-blue-500',
  image: 'text-purple-500',
  xls: 'text-green-500',
  xlsx: 'text-green-500',
}

export function Documents() {
  const [view, setView] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(1)

  const filteredDocuments = sampleDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.matter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = selectedFolder === 1 || doc.folder === sampleFolders.find(f => f.id === selectedFolder)?.name
    return matchesSearch && matchesFolder
  })

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, doc) => {
        const Icon = fileIcons[doc.type] || FileText
        return (
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${fileColors[doc.type] || 'text-slate-400'}`} />
            <div>
              <p className="font-medium text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{doc.matter}</p>
            </div>
          </div>
        )
      },
    },
    { key: 'folder', title: 'Folder' },
    { key: 'size', title: 'Size' },
    {
      key: 'uploadedAt',
      title: 'Uploaded',
      render: (value) => formatDate(value),
    },
    { key: 'uploadedBy', title: 'By' },
    {
      key: 'actions',
      title: '',
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500">Manage and organize your files</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Folder Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {sampleFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                    selectedFolder === folder.id ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setView('grid')}
                className={view === 'grid' ? 'bg-blue-600' : ''}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
            <CardContent className="py-8">
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700">Drag and drop files here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {filteredDocuments.length === 0 ? (
            <EmptyState
              title="No documents found"
              description="Upload your first document to get started."
              actionLabel="Upload Document"
              onAction={() => {}}
            />
          ) : (
            <DataTable
              columns={columns}
              data={filteredDocuments}
              emptyMessage="No documents found"
            />
          )}
        </div>
      </div>
    </div>
  )
}
