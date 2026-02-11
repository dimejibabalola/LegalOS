import { useState } from 'react'
import {
  Building2,
  User,
  Users,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/common/DataTable'
import { getInitials } from '@/lib/utils'

const sampleUsers = [
  { id: 1, name: 'John Doe', email: 'john@firm.com', role: 'Partner', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@firm.com', role: 'Associate', status: 'active' },
  { id: 3, name: 'Mike Johnson', email: 'mike@firm.com', role: 'Paralegal', status: 'active' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@firm.com', role: 'Staff', status: 'inactive' },
]

const roleColors = {
  Partner: 'bg-purple-100 text-purple-700',
  Associate: 'bg-blue-100 text-blue-700',
  Paralegal: 'bg-green-100 text-green-700',
  Staff: 'bg-slate-100 text-slate-700',
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('firm')

  const userColumns = [
    {
      key: 'name',
      title: 'User',
      render: (value, user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getInitials(value)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <Badge className={roleColors[value]}>{value}</Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge className={value === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your firm settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="firm">Firm</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="firm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Firm Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Firm Name</Label>
                  <Input defaultValue="Babalola & Associates" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="info@babalolalaw.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input defaultValue="www.babalolalaw.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue="123 Legal Avenue, Suite 500" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input defaultValue="New York" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input defaultValue="NY" />
                </div>
                <div className="space-y-2">
                  <Label>ZIP</Label>
                  <Input defaultValue="10001" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Billing Rate</Label>
                  <Input defaultValue="350" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms (Days)</Label>
                  <Input defaultValue="30" type="number" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <User className="h-4 w-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={userColumns}
                data={sampleUsers}
                emptyMessage="No users found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="john@firm.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="(555) 987-6543" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  { label: 'New task assignments', default: true },
                  { label: 'Task due date reminders', default: true },
                  { label: 'Invoice payments', default: true },
                  { label: 'Client messages', default: false },
                  { label: 'Calendar event reminders', default: true },
                  { label: 'Matter updates', default: false },
                ].map((item) => (
                  <label key={item.label} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={item.default}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
