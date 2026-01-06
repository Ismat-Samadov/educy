import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { requireInstructor } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

export default async function InstructorAssignmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    await requireInstructor()
  } catch {
    redirect('/unauthorized')
  }

  const userId = session.user.id

  // Fetch all assignments from instructor's sections
  const assignments = await prisma.assignment.findMany({
    where: {
      section: {
        instructorId: userId,
      },
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
      _count: {
        select: {
          submissions: true,
        },
      },
      submissions: {
        where: {
          grade: null,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: { dueDate: 'desc' },
  })

  const now = new Date()
  const upcomingAssignments = assignments.filter((a) => new Date(a.dueDate) > now)
  const pastAssignments = assignments.filter((a) => new Date(a.dueDate) <= now)

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Assignments
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage assignments and grade submissions
            </p>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upcoming Assignments ({upcomingAssignments.length})
            </h2>
          </div>
          <div className="p-6">
            {upcomingAssignments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No upcoming assignments
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {assignment.section.course.code}: {assignment.section.course.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                          {new Date(assignment.dueDate).toLocaleTimeString()}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {assignment._count.submissions} submissions
                          </span>
                          {assignment.submissions.length > 0 && (
                            <span className="text-orange-600 dark:text-orange-400">
                              {assignment.submissions.length} pending grading
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/instructor/assignments/${assignment.id}`}
                        className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Past Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Past Assignments ({pastAssignments.length})
            </h2>
          </div>
          <div className="p-6">
            {pastAssignments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No past assignments
              </p>
            ) : (
              <div className="space-y-4">
                {pastAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {assignment.section.course.code}: {assignment.section.course.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {assignment._count.submissions} submissions
                          </span>
                          {assignment.submissions.length > 0 && (
                            <span className="text-orange-600 dark:text-orange-400">
                              {assignment.submissions.length} pending grading
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/instructor/assignments/${assignment.id}`}
                        className="ml-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                      >
                        View
                      </Link>
                    </div>
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
