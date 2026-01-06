import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DayOfWeek } from '@prisma/client'

const navigation = [
  { name: 'Dashboard', href: '/student', icon: '📊' },
  { name: 'Courses', href: '/student/courses', icon: '📚' },
  { name: 'Timetable', href: '/student/timetable', icon: '📅' },
  { name: 'Assignments', href: '/student/assignments', icon: '📝' },
]

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default async function StudentTimetablePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get all enrolled sections
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: 'ENROLLED' },
    include: {
      section: {
        include: {
          course: true,
          lessons: {
            include: {
              room: true,
            },
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' },
            ],
          },
        },
      },
    },
  })

  // Organize lessons by day
  const lessonsByDay: Record<DayOfWeek, Array<any>> = {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  }

  enrollments.forEach((enrollment) => {
    enrollment.section.lessons.forEach((lesson) => {
      lessonsByDay[lesson.dayOfWeek].push({
        ...lesson,
        course: enrollment.section.course,
      })
    })
  })

  return (
    <DashboardLayout navigation={navigation}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Timetable
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your weekly class schedule
          </p>
        </div>

        {/* Weekly Timetable */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Classes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {DAYS.map((day, index) => (
                  <tr key={day} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {DAY_NAMES[index]}
                    </td>
                    <td className="px-6 py-4">
                      {lessonsByDay[day].length === 0 ? (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          No classes
                        </span>
                      ) : (
                        <div className="space-y-3">
                          {lessonsByDay[day].map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-start space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex-shrink-0">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                  {lesson.startTime}
                                </div>
                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                  {lesson.endTime}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {lesson.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {lesson.course.code} - {lesson.course.title}
                                </p>
                                {lesson.room && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    📍 {lesson.room.name}
                                    {lesson.room.location && ` (${lesson.room.location})`}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calendar View Hint */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> You can export your timetable to your calendar app (Coming soon)
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
