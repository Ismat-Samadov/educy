import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { requireModerator } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

export default async function ModeratorDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    await requireModerator()
  } catch {
    redirect('/unauthorized')
  }

  // Fetch pending enrollments
  const pendingEnrollments = await prisma.enrollment.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      section: {
        include: {
          course: true,
          instructor: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  status: 'ENROLLED',
                },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  // Fetch all courses for content management view
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          sections: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Fetch recent enrollments (for activity monitoring)
  const recentEnrollments = await prisma.enrollment.findMany({
    where: { status: 'ENROLLED' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      section: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
    take: 5,
  })

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Moderator Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {session.user.name}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Enrollments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingEnrollments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 inline-block">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Courses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {courses.length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 inline-block">
              <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Recent Enrollments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {recentEnrollments.length}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Enrollment Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pending Enrollment Requests
            </h2>
          </div>
          <div className="p-6">
            {pendingEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending enrollment requests
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {enrollment.user.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {enrollment.user.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Course: {enrollment.section.course.code} - {enrollment.section.course.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Instructor: {enrollment.section.instructor.name} • Capacity:{' '}
                        {enrollment.section._count.enrollments}/{enrollment.section.capacity}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Requested: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Courses
            </h2>
          </div>
          <div className="p-6">
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No courses available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {course.code}: {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {course._count.sections} section(s)
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
