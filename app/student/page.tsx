import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'


export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get student enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: 'ENROLLED' },
    include: {
      section: {
        include: {
          course: true,
          instructor: { select: { name: true } },
        },
      },
    },
  })

  // Get upcoming assignments
  const upcomingAssignments = await prisma.assignment.findMany({
    where: {
      section: {
        enrollments: {
          some: {
            userId: user.id,
            status: 'ENROLLED',
          },
        },
      },
      dueDate: {
        gte: new Date(),
      },
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
      submissions: {
        where: { studentId: user.id },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  })

  // Get recent notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <DashboardLayout role={user.role}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-blue-100">
            Here's what's happening in your courses today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Enrolled Courses
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {enrollments.length}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Assignments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {upcomingAssignments.filter(a => a.submissions.length === 0).length}
                </p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Unread Notifications
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {notifications.filter(n => !n.readAt).length}
                </p>
              </div>
              <div className="text-4xl">🔔</div>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Upcoming Assignments
            </h2>
          </div>
          <div className="p-6">
            {upcomingAssignments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No upcoming assignments
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => {
                  const isSubmitted = assignment.submissions.length > 0
                  const daysUntilDue = Math.ceil(
                    (assignment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )

                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {assignment.section.course.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Due: {assignment.dueDate.toLocaleDateString()}
                          {daysUntilDue <= 3 && !isSubmitted && (
                            <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                              (Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {isSubmitted ? (
                          <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            Submitted
                          </span>
                        ) : (
                          <Link
                            href={`/student/assignments/${assignment.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            Submit
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Courses
            </h2>
          </div>
          <div className="p-6">
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You're not enrolled in any courses yet.
                </p>
                <Link
                  href="/student/courses"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {enrollment.section.course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {enrollment.section.course.code} • {enrollment.section.term}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Instructor: {enrollment.section.instructor.name}
                    </p>
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
