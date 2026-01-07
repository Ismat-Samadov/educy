'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard-layout'

type AuditLog = {
  id: string
  userId: string | null
  user: {
    name: string
    email: string
    role: string
  } | null
  action: string
  targetType: string | null
  targetId: string | null
  details: any
  createdAt: string
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated or not admin/moderator
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
      router.push('/unauthorized')
    }
  }, [session, status, router])

  // Fetch audit logs
  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR') {
      fetchLogs(pagination.page)
    }
  }, [session, pagination.page])

  const fetchLogs = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/audit-logs?page=${page}&limit=${pagination.limit}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.logs)
        setPagination(data.pagination)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    if (action.includes('UPDATED') || action.includes('CHANGED')) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    if (action.includes('DELETED')) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    if (action.includes('APPROVED')) return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    if (action.includes('REJECTED')) return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role={session?.user?.role || 'STUDENT'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading audit logs...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={session?.user?.role || 'ADMIN'}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Logs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            System activity and security logs
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pagination.total}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pagination.page} / {pagination.totalPages}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Showing</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {logs.length} logs
              </p>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.user?.name || 'System'}
                          </div>
                          {log.user && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {log.user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.targetType && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {log.targetType}
                            {log.targetId && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                ID: {log.targetId.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.details && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
                              View details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-w-md">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
