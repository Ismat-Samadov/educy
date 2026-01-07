import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { requireInstructor } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'
import GradeSubmissionForm from './grade-form'

export default async function AssignmentGradingPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    await requireInstructor()
  } catch {
    redirect('/unauthorized')
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: {
      section: {
        include: {
          course: true,
        },
      },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })

  if (!assignment) {
    notFound()
  }

  // Check access
  if (assignment.section.instructorId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const gradedCount = assignment.submissions.filter((s) => s.grade !== null).length
  const ungradedCount = assignment.submissions.length - gradedCount

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/instructor/courses/${assignment.section.courseId}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            ← Back to course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {assignment.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {assignment.section.course.code}: {assignment.section.course.title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Due: {new Date(assignment.dueDate).toLocaleString()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Submissions
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {assignment.submissions.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Grading
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
              {ungradedCount}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Graded
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {gradedCount}
            </p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Submissions
            </h2>
          </div>
          <div className="p-6">
            {assignment.submissions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No submissions yet
              </p>
            ) : (
              <div className="space-y-4">
                {assignment.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {submission.student.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {submission.student.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {submission.grade !== null ? (
                          <div>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {submission.grade}%
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Graded {new Date(submission.gradedAt!).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm font-medium rounded-full">
                            Not Graded
                          </span>
                        )}
                      </div>
                    </div>

                    {submission.text && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {submission.text}
                        </p>
                      </div>
                    )}

                    {submission.fileKey && (
                      <div className="mb-4">
                        <a
                          href={`/api/files/${submission.fileKey}/download-url`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          📎 Download Submission
                        </a>
                      </div>
                    )}

                    <GradeSubmissionForm submission={submission} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
