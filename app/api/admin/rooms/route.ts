import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

// GET /api/admin/rooms - List all rooms (accessible by instructors for selection)
export async function GET(request: NextRequest) {
  try {
    // Allow any authenticated user to view rooms for selection
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      rooms,
    })
  } catch (error) {
    console.error('Rooms fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
