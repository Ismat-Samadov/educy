import { RoleName } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [RoleName.ADMIN]: [
    'manage_users',
    'manage_roles',
    'manage_rooms',
    'manage_courses',
    'manage_sections',
    'manage_enrollments',
    'view_audit_logs',
    'manage_settings',
    'view_reports',
  ],
  [RoleName.MODERATOR]: [
    'manage_enrollments',
    'manage_content',
    'view_courses',
  ],
  [RoleName.INSTRUCTOR]: [
    'create_courses',
    'manage_own_courses',
    'create_lessons',
    'create_assignments',
    'grade_submissions',
    'view_enrollments',
    'manage_schedules',
  ],
  [RoleName.STUDENT]: [
    'view_courses',
    'enroll_courses',
    'view_timetable',
    'submit_assignments',
    'view_grades',
  ],
}

// Helper function to check if a role has a specific permission
export function hasPermission(role: RoleName, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Helper function to check if a role has any of the specified permissions
export function hasAnyPermission(role: RoleName, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

// Helper function to check if a role has all of the specified permissions
export function hasAllPermissions(role: RoleName, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

// Get current session with role
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

// Middleware helpers for API routes
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: RoleName[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
  return user
}

export async function requirePermission(permission: string) {
  const user = await requireAuth()
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Forbidden: Missing permission '${permission}'`)
  }
  return user
}

// Check if user is admin
export async function requireAdmin() {
  return requireRole([RoleName.ADMIN])
}

// Check if user is instructor
export async function requireInstructor() {
  return requireRole([RoleName.INSTRUCTOR, RoleName.ADMIN])
}

// Check if user is moderator or admin
export async function requireModerator() {
  return requireRole([RoleName.MODERATOR, RoleName.ADMIN])
}
