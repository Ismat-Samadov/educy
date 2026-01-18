import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema for system settings with safeguards
// Transform empty strings to null for optional fields
const updateSettingsSchema = z.object({
  // Platform Identity
  platformName: z.string().min(1).max(50).optional(),
  platformLogoUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().url(), z.null()]).optional()
  ),

  // Email Configuration
  systemEmailFrom: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().email(), z.null()]).optional()
  ),
  systemEmailName: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().min(1).max(100), z.null()]).optional()
  ),

  // Security Settings (with hard limits)
  passwordMinLength: z.number().min(6).max(32).optional(),
  passwordRequireUpper: z.boolean().optional(),
  passwordRequireLower: z.boolean().optional(),
  passwordRequireNumber: z.boolean().optional(),
  passwordRequireSpecial: z.boolean().optional(),

  // Storage Limits (1MB to 100MB)
  maxUploadSizeMB: z.number().min(1).max(100).optional(),

  // Feature Flags
  enableCaseRooms: z.boolean().optional(),
  enableExams: z.boolean().optional(),
  enableCertificates: z.boolean().optional(),
  enablePayments: z.boolean().optional(),

  // Enrollment Limits
  maxEnrollmentsPerStudent: z.preprocess(
    (val) => (val === 0 || val === '' ? null : val),
    z.union([z.number().min(1).max(20), z.null()]).optional()
  ),
})

// GET /api/admin/system-settings - Get system settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Get or create system settings (there should only be one record)
    let settings = await prisma.systemSettings.findFirst()

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          platformName: 'Educy',
          lastModifiedBy: session.user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('System settings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system settings' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/system-settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateSettingsSchema.parse(body)

    // Additional validation: Password policy must allow some passwords
    if (data.passwordMinLength !== undefined && data.passwordMinLength > 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password minimum length too high',
          errors: {
            passwordMinLength: 'Minimum length cannot exceed 20 characters (recommended: 8-12)',
          },
        },
        { status: 400 }
      )
    }

    // Get or create settings record
    let settings = await prisma.systemSettings.findFirst()

    if (!settings) {
      // Create new record
      settings = await prisma.systemSettings.create({
        data: {
          ...data,
          lastModifiedBy: session.user.id,
        },
      })
    } else {
      // Update existing record
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          ...data,
          lastModifiedBy: session.user.id,
        },
      })
    }

    // Create audit log for this critical change
    const changedFields = Object.keys(data).filter(
      (key) => data[key as keyof typeof data] !== undefined
    )

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SYSTEM_SETTINGS_UPDATED',
        targetType: 'SystemSettings',
        targetId: settings.id,
        details: {
          changedFields,
          changes: data,
        },
        severity: 'CRITICAL',
        category: 'SYSTEM',
      },
    })

    return NextResponse.json({
      success: true,
      settings,
      message: 'System settings updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Provide field-specific error messages
      const firstError = error.errors[0]
      let errorMessage = 'Validation error'
      const fieldErrors: Record<string, string> = {}

      error.errors.forEach((err) => {
        const field = err.path.join('.')

        switch (field) {
          case 'platformName':
            fieldErrors[field] = 'Platform name must be between 1-50 characters'
            break
          case 'platformLogoUrl':
            fieldErrors[field] = 'Please enter a valid URL for the logo'
            break
          case 'systemEmailFrom':
            fieldErrors[field] = 'Please enter a valid email address'
            break
          case 'passwordMinLength':
            fieldErrors[field] = 'Password length must be between 6-32 characters'
            break
          case 'maxUploadSizeMB':
            fieldErrors[field] = 'Upload size must be between 1-100 MB'
            break
          default:
            fieldErrors[field] = err.message
        }
      })

      if (firstError) {
        const field = firstError.path.join('.')
        errorMessage = fieldErrors[field] || firstError.message
      }

      console.error('Validation error:', error.errors)
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errors: fieldErrors,
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('System settings update error:', error)
    
    // Provide more specific error messages for common issues
    let errorMessage = 'Failed to update system settings'
    if (error instanceof Error) {
      // Check for specific database errors
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'A configuration conflict occurred. Please try again.'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Related data validation failed. Please check your inputs.'
      } else if (error.message.includes('Connection')) {
        errorMessage = 'Database connection error. Please try again later.'
      }
      // Log the actual error for debugging
      console.error('Detailed error:', error.message)
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
