import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { AuthProvider } from '@/context/AuthContext'
import { TimerProvider } from '@/context/TimerContext'
import { ToastProviderComponent } from '@/context/ToastContext'
import { useAuth } from '@/hooks/useAuth'

// Pages
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Calendar } from '@/pages/Calendar'
import { Tasks } from '@/pages/Tasks'
import { Matters } from '@/pages/Matters'
import { MatterDetail } from '@/pages/MatterDetail'
import { Clients } from '@/pages/Clients'
import { ClientDetail } from '@/pages/ClientDetail'
import { Contacts } from '@/pages/Contacts'
import { Activities } from '@/pages/Activities'
import { Billing } from '@/pages/Billing'
import { Invoices } from '@/pages/Invoices'
import { InvoiceDetail } from '@/pages/InvoiceDetail'
import { TimeEntries } from '@/pages/TimeEntries'
import { Accounts } from '@/pages/Accounts'
import { Documents } from '@/pages/Documents'
import { Communications } from '@/pages/Communications'
import { Reports } from '@/pages/Reports'
import { Conflicts } from '@/pages/Conflicts'
import { Settings } from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/new" element={<Tasks />} />
        <Route path="matters" element={<Matters />} />
        <Route path="matters/new" element={<Matters />} />
        <Route path="matters/:id" element={<MatterDetail />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/new" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="activities" element={<Activities />} />
        <Route path="billing" element={<Billing />} />
        <Route path="billing/invoices" element={<Invoices />} />
        <Route path="billing/invoices/new" element={<Invoices />} />
        <Route path="billing/invoices/:id" element={<InvoiceDetail />} />
        <Route path="billing/time" element={<TimeEntries />} />
        <Route path="billing/time/new" element={<TimeEntries />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="documents" element={<Documents />} />
        <Route path="communications" element={<Communications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="conflicts" element={<Conflicts />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProviderComponent>
          <AuthProvider>
            <TimerProvider>
              <AppRoutes />
            </TimerProvider>
          </AuthProvider>
        </ToastProviderComponent>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
