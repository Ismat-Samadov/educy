import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can view all users
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only admins can view users' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            enrollments: true,
            instructorSections: true,
            createdCourses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
