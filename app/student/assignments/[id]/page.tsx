'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard-layout'

interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: string
  allowedFileTypes: string[]
  maxSizeBytes: number
  section: {
    course: {
      code: string
      title: string
    }
  }
}

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')

  useEffect(() => {
    // Fetch assignment details
    fetch(`/api/assignments/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAssignment(data.assignment)
        }
      })
      .catch((err) => console.error('Failed to fetch assignment:', err))
  }, [params.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size
    if (assignment && selectedFile.size > assignment.maxSizeBytes) {
      setError(`File size exceeds limit of ${(assignment.maxSizeBytes / 1048576).toFixed(0)}MB`)
      return
    }

    // Validate file type
    if (assignment && assignment.allowedFileTypes.length > 0) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (!extension || !assignment.allowedFileTypes.includes(extension)) {
        setError(`File type .${extension} not allowed. Allowed types: ${assignment.allowedFileTypes.join(', ')}`)
        return
      }
    }

    setError('')
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let fileKey: string | undefined

      // Upload file if selected
      if (file) {
        setUploading(true)

        // Get signed upload URL
        const urlResponse = await fetch('/api/files/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            sizeBytes: file.size,
          }),
        })

        const urlData = await urlResponse.json()
        if (!urlResponse.ok) throw new Error(urlData.error || 'Failed to get upload URL')

        // Upload to R2
        await fetch(urlData.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        fileKey = urlData.fileKey
        setUploading(false)
      }

      // Submit assignment
      const response = await fetch(`/api/assignments/${params.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey,
          text: text || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to submit assignment')

      router.push('/student/assignments')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (!session?.user || !assignment) {
    return (
      <DashboardLayout role={session?.user?.role || 'STUDENT'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const dueDate = new Date(assignment.dueDate)
  const isOverdue = dueDate < new Date()

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Submit Assignment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {assignment.section.course.code}: {assignment.section.course.title}
          </p>
        </div>

        {/* Assignment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {assignment.title}
          </h2>
          {assignment.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
              {assignment.description}
            </p>
          )}
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Due: </span>
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-900 dark:text-white'}>
                {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
              </span>
            </div>
            {assignment.allowedFileTypes.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Allowed: </span>
                <span className="text-gray-900 dark:text-white">
                  {assignment.allowedFileTypes.join(', ')}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600 dark:text-gray-400">Max size: </span>
              <span className="text-gray-900 dark:text-white">
                {(assignment.maxSizeBytes / 1048576).toFixed(0)}MB
              </span>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {isOverdue && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg">
                ⚠️ This assignment is overdue. Late submissions may receive reduced credit.
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File {assignment.allowedFileTypes.length > 0 && '(Required)'}
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                accept={assignment.allowedFileTypes.length > 0 ? assignment.allowedFileTypes.map(t => `.${t}`).join(',') : undefined}
              />
              {file && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Selected: {file.name} ({(file.size / 1048576).toFixed(2)}MB)
                </p>
              )}
            </div>

            {/* Text Submission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add any comments or notes about your submission..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
