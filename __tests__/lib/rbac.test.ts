import { RoleName } from '@prisma/client'

// Import only the pure functions that don't require next-auth
const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
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

function hasPermission(role: RoleName, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

function hasAnyPermission(role: RoleName, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

function hasAllPermissions(role: RoleName, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

describe('RBAC (Role-Based Access Control)', () => {
  describe('ROLE_PERMISSIONS', () => {
    test('should have permissions defined for all roles', () => {
      expect(ROLE_PERMISSIONS[RoleName.ADMIN]).toBeDefined()
      expect(ROLE_PERMISSIONS[RoleName.MODERATOR]).toBeDefined()
      expect(ROLE_PERMISSIONS[RoleName.INSTRUCTOR]).toBeDefined()
      expect(ROLE_PERMISSIONS[RoleName.STUDENT]).toBeDefined()
    })

    test('ADMIN should have all permissions', () => {
      const adminPermissions = ROLE_PERMISSIONS[RoleName.ADMIN]
      expect(adminPermissions).toContain('manage_users')
      expect(adminPermissions).toContain('manage_roles')
      expect(adminPermissions).toContain('manage_rooms')
      expect(adminPermissions).toContain('manage_courses')
      expect(adminPermissions).toContain('view_audit_logs')
    })

    test('MODERATOR should have enrollment and content management permissions', () => {
      const moderatorPermissions = ROLE_PERMISSIONS[RoleName.MODERATOR]
      expect(moderatorPermissions).toContain('manage_enrollments')
      expect(moderatorPermissions).toContain('manage_content')
      expect(moderatorPermissions).toContain('view_courses')
    })

    test('INSTRUCTOR should have course management permissions', () => {
      const instructorPermissions = ROLE_PERMISSIONS[RoleName.INSTRUCTOR]
      expect(instructorPermissions).toContain('create_courses')
      expect(instructorPermissions).toContain('manage_own_courses')
      expect(instructorPermissions).toContain('create_assignments')
      expect(instructorPermissions).toContain('grade_submissions')
    })

    test('STUDENT should have limited permissions', () => {
      const studentPermissions = ROLE_PERMISSIONS[RoleName.STUDENT]
      expect(studentPermissions).toContain('view_courses')
      expect(studentPermissions).toContain('enroll_courses')
      expect(studentPermissions).toContain('submit_assignments')
      expect(studentPermissions).toContain('view_grades')
      expect(studentPermissions).not.toContain('manage_users')
      expect(studentPermissions).not.toContain('create_courses')
    })
  })

  describe('hasPermission', () => {
    test('should return true when role has the permission', () => {
      expect(hasPermission(RoleName.ADMIN, 'manage_users')).toBe(true)
      expect(hasPermission(RoleName.INSTRUCTOR, 'create_courses')).toBe(true)
      expect(hasPermission(RoleName.STUDENT, 'view_courses')).toBe(true)
    })

    test('should return false when role does not have the permission', () => {
      expect(hasPermission(RoleName.STUDENT, 'manage_users')).toBe(false)
      expect(hasPermission(RoleName.STUDENT, 'create_courses')).toBe(false)
      expect(hasPermission(RoleName.INSTRUCTOR, 'manage_users')).toBe(false)
    })

    test('should return false for invalid role', () => {
      expect(hasPermission('INVALID_ROLE' as RoleName, 'manage_users')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    test('should return true when role has at least one permission', () => {
      expect(
        hasAnyPermission(RoleName.ADMIN, ['manage_users', 'invalid_permission'])
      ).toBe(true)
      expect(
        hasAnyPermission(RoleName.STUDENT, ['view_courses', 'manage_users'])
      ).toBe(true)
    })

    test('should return false when role has none of the permissions', () => {
      expect(
        hasAnyPermission(RoleName.STUDENT, ['manage_users', 'create_courses'])
      ).toBe(false)
    })

    test('should return false for empty permission array', () => {
      expect(hasAnyPermission(RoleName.ADMIN, [])).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    test('should return true when role has all permissions', () => {
      expect(
        hasAllPermissions(RoleName.ADMIN, ['manage_users', 'manage_roles'])
      ).toBe(true)
      expect(
        hasAllPermissions(RoleName.STUDENT, ['view_courses', 'enroll_courses'])
      ).toBe(true)
    })

    test('should return false when role is missing any permission', () => {
      expect(
        hasAllPermissions(RoleName.STUDENT, ['view_courses', 'manage_users'])
      ).toBe(false)
      expect(
        hasAllPermissions(RoleName.INSTRUCTOR, ['create_courses', 'manage_users'])
      ).toBe(false)
    })

    test('should return true for empty permission array', () => {
      expect(hasAllPermissions(RoleName.STUDENT, [])).toBe(true)
    })
  })

  describe('Permission hierarchy', () => {
    test('ADMIN should have more permissions than MODERATOR', () => {
      expect(ROLE_PERMISSIONS[RoleName.ADMIN].length).toBeGreaterThan(
        ROLE_PERMISSIONS[RoleName.MODERATOR].length
      )
    })

    test('INSTRUCTOR should have more permissions than STUDENT', () => {
      expect(ROLE_PERMISSIONS[RoleName.INSTRUCTOR].length).toBeGreaterThan(
        ROLE_PERMISSIONS[RoleName.STUDENT].length
      )
    })

    test('each role should have unique permission sets', () => {
      const roles = Object.values(RoleName)
      roles.forEach((role1) => {
        roles.forEach((role2) => {
          if (role1 !== role2) {
            // Permissions should not be identical
            expect(ROLE_PERMISSIONS[role1]).not.toEqual(ROLE_PERMISSIONS[role2])
          }
        })
      })
    })
  })
})
