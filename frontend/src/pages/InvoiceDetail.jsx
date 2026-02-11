import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Send,
  CheckCircle,
  Download,
  Printer,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'

const sampleInvoice = {
  id: 1,
  number: 'INV-2024-001',
  client: {
    name: 'ABC Corporation',
    email: 'billing@abccorp.com',
    phone: '(555) 234-5678',
    address: '456 Business Ave, Suite 200, New York, NY 10002',
  },
  matter: 'ABC Corp Contract Review',
  status: 'draft',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  subtotal: 5000,
  tax: 0,
  total: 5500,
  lineItems: [
    { id: 1, description: 'Legal consultation - 5 hours', quantity: 5, rate: 350, amount: 1750 },
    { id: 2, description: 'Contract review and revision', quantity: 8, rate: 350, amount: 2800 },
    { id: 3, description: 'Filing fees', quantity: 1, rate: 450, amount: 450 },
  ],
  notes: 'Payment due within 30 days. Thank you for your business.',
}

const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/billing/invoices')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{sampleInvoice.number}</h1>
            <Badge className={statusColors[sampleInvoice.status]}>
              {sampleInvoice.status.charAt(0).toUpperCase() + sampleInvoice.status.slice(1)}
            </Badge>
          </div>
          <p className="text-slate-500">{sampleInvoice.matter}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleInvoice.status === 'draft' && (
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
              Send Invoice
            </Button>
          )}
          {sampleInvoice.status === 'sent' && (
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">INVOICE</h2>
                  <p className="text-slate-500">{sampleInvoice.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Date: {formatDate(sampleInvoice.date)}</p>
                  <p className="text-sm text-slate-500">Due Date: {formatDate(sampleInvoice.dueDate)}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="mb-8">
                <p className="text-sm text-slate-500 mb-2">Bill To:</p>
                <p className="font-semibold text-slate-900">{sampleInvoice.client.name}</p>
                <p className="text-slate-600">{sampleInvoice.client.address}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {sampleInvoice.client.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {sampleInvoice.client.phone}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-sm font-medium text-slate-600">Description</th>
                    <th className="text-right py-2 text-sm font-medium text-slate-600">Qty</th>
                    <th className="text-right py-2 text-sm font-medium text-slate-600">Rate</th>
                    <th className="text-right py-2 text-sm font-medium text-slate-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleInvoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-900">{item.description}</td>
                      <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(sampleInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span>{formatCurrency(sampleInvoice.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(sampleInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {sampleInvoice.notes && (
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">Notes:</p>
                  <p className="text-slate-700">{sampleInvoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <Badge className={statusColors[sampleInvoice.status]}>
                  {sampleInvoice.status.charAt(0).toUpperCase() + sampleInvoice.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Invoice Date</span>
                <span>{formatDate(sampleInvoice.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Due Date</span>
                <span>{formatDate(sampleInvoice.dueDate)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>{formatCurrency(sampleInvoice.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{sampleInvoice.client.name}</p>
              <p className="text-sm text-slate-600">{sampleInvoice.client.address}</p>
              <div className="text-sm text-slate-500 space-y-1">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {sampleInvoice.client.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {sampleInvoice.client.phone}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
