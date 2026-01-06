import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'

const navigation = [
  { name: 'Dashboard', href: '/student', icon: '📊' },
  { name: 'Courses', href: '/student/courses', icon: '📚' },
  { name: 'Timetable', href: '/student/timetable', icon: '📅' },
  { name: 'Assignments', href: '/student/assignments', icon: '📝' },
]

export default async function StudentCoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get enrolled courses
  const enrolledCourses = await prisma.enrollment.findMany({
    where: { userId: user.id, status: 'ENROLLED' },
    include: {
      section: {
        include: {
          course: true,
          instructor: { select: { name: true, email: true } },
          _count: {
            select: { enrollments: true },
          },
        },
      },
    },
  })

  // Get available courses (not enrolled)
  const availableCourses = await prisma.course.findMany({
    where: {
      visibility: true,
      sections: {
        some: {
          enrollments: {
            none: {
              userId: user.id,
              status: { in: ['ENROLLED', 'PENDING'] },
            },
          },
        },
      },
    },
    include: {
      sections: {
        include: {
          instructor: { select: { name: true } },
          _count: {
            select: { enrollments: true },
          },
        },
      },
    },
  })

  return (
    <DashboardLayout navigation={navigation}>
      <div className="space-y-8">
        {/* Enrolled Courses */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            My Courses
          </h1>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 dark:text-gray-400">
                You're not enrolled in any courses yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {enrollment.section.course.code}
                        </span>
                      </div>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                        Enrolled
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {enrollment.section.course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {enrollment.section.course.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Instructor:</strong> {enrollment.section.instructor.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Term:</strong> {enrollment.section.term}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Students:</strong> {enrollment.section._count.enrollments}/{enrollment.section.capacity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Courses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                        {course.code}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      {course.sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {section.instructor.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {section.term} • {section._count.enrollments}/{section.capacity} students
                            </p>
                          </div>
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                            disabled={section._count.enrollments >= section.capacity}
                          >
                            {section._count.enrollments >= section.capacity ? 'Full' : 'Enroll'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
