import { AuditLogSeverity } from '@prisma/client'
import {
  getSeverityForAction,
  getCategoryForAction,
  AuditCategory,
} from '@/lib/audit'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
    },
  },
}))

describe('Audit Utility', () => {
  describe('getSeverityForAction', () => {
    test('should return CRITICAL for role change actions', () => {
      expect(getSeverityForAction('USER_ROLE_CHANGED')).toBe('CRITICAL')
      expect(getSeverityForAction('PERMISSION_UPDATED')).toBe('CRITICAL')
    })

    test('should return CRITICAL for deletion actions', () => {
      expect(getSeverityForAction('USER_DELETED')).toBe('CRITICAL')
      expect(getSeverityForAction('ROOM_DELETED')).toBe('CRITICAL')
      expect(getSeverityForAction('COURSE_DELETED')).toBe('CRITICAL')
    })

    test('should return CRITICAL for system errors', () => {
      expect(getSeverityForAction('SYSTEM_ERROR')).toBe('CRITICAL')
      expect(getSeverityForAction('INTEGRATION_FAILURE')).toBe('CRITICAL')
      expect(getSeverityForAction('DATA_INCONSISTENCY')).toBe('CRITICAL')
    })

    test('should return WARNING for failed actions', () => {
      expect(getSeverityForAction('LOGIN_FAILED')).toBe('WARNING')
      expect(getSeverityForAction('UPLOAD_FAILED')).toBe('WARNING')
      expect(getSeverityForAction('RETRY_ATTEMPTED')).toBe('WARNING')
    })

    test('should return WARNING for rejection actions', () => {
      expect(getSeverityForAction('ENROLLMENT_REJECTED')).toBe('WARNING')
      expect(getSeverityForAction('REQUEST_REJECTED')).toBe('WARNING')
    })

    test('should return INFO for regular operations', () => {
      expect(getSeverityForAction('USER_LOGIN')).toBe('INFO')
      expect(getSeverityForAction('USER_LOGOUT')).toBe('INFO')
      expect(getSeverityForAction('COURSE_CREATED')).toBe('INFO')
      expect(getSeverityForAction('ASSIGNMENT_SUBMITTED')).toBe('INFO')
    })

    test('should return INFO for undefined actions', () => {
      expect(getSeverityForAction('CUSTOM_ACTION')).toBe('INFO')
      expect(getSeverityForAction('')).toBe('INFO')
    })
  })

  describe('getCategoryForAction', () => {
    test('should return SECURITY for authentication actions', () => {
      expect(getCategoryForAction('USER_LOGIN')).toBe('SECURITY')
      expect(getCategoryForAction('USER_LOGOUT')).toBe('SECURITY')
      expect(getCategoryForAction('AUTH_TOKEN_GENERATED')).toBe('SECURITY')
    })

    test('should return SYSTEM for error actions', () => {
      expect(getCategoryForAction('SYSTEM_ERROR')).toBe('SYSTEM')
      expect(getCategoryForAction('INTEGRATION_FAILURE')).toBe('SYSTEM')
      expect(getCategoryForAction('DATABASE_ERROR')).toBe('SYSTEM')
    })

    test('should return ADMIN_ACTION for administrative operations', () => {
      expect(getCategoryForAction('USER_ROLE_CHANGED')).toBe('ADMIN_ACTION')
      expect(getCategoryForAction('PERMISSION_UPDATED')).toBe('ADMIN_ACTION')
      expect(getCategoryForAction('USER_CREATED')).toBe('ADMIN_ACTION')
      expect(getCategoryForAction('USER_DELETED')).toBe('ADMIN_ACTION')
      expect(getCategoryForAction('ROOM_CREATED')).toBe('ADMIN_ACTION')
    })

    test('should return USER_ACTION for regular user operations', () => {
      expect(getCategoryForAction('ASSIGNMENT_SUBMITTED')).toBe('USER_ACTION')
      expect(getCategoryForAction('ENROLLMENT_APPROVED')).toBe('USER_ACTION')
      expect(getCategoryForAction('CUSTOM_ACTION')).toBe('USER_ACTION')
    })

    test('should handle empty or undefined action names', () => {
      expect(getCategoryForAction('')).toBe('USER_ACTION')
    })
  })

  describe('Action categorization consistency', () => {
    test('critical actions should have appropriate categories', () => {
      const criticalActions = [
        'USER_DELETED',
        'ROLE_CHANGED',
        'SYSTEM_ERROR',
        'INTEGRATION_FAILURE',
      ]

      criticalActions.forEach((action) => {
        const severity = getSeverityForAction(action)
        const category = getCategoryForAction(action)
        
        expect(severity).toBe('CRITICAL')
        expect(['ADMIN_ACTION', 'SYSTEM']).toContain(category)
      })
    })

    test('warning actions should be properly categorized', () => {
      const warningActions = ['LOGIN_FAILED', 'ENROLLMENT_REJECTED', 'UPLOAD_FAILED']

      warningActions.forEach((action) => {
        const severity = getSeverityForAction(action)
        expect(severity).toBe('WARNING')
      })
    })

    test('security actions should use SECURITY category', () => {
      const securityActions = ['USER_LOGIN', 'USER_LOGOUT', 'AUTH_FAILED']

      securityActions.forEach((action) => {
        const category = getCategoryForAction(action)
        expect(category).toBe('SECURITY')
      })
    })
  })

  describe('Edge cases', () => {
    test('should handle mixed case action names', () => {
      expect(getSeverityForAction('user_deleted')).toBe('INFO') // lowercase
      expect(getSeverityForAction('USER_DELETED')).toBe('CRITICAL') // uppercase
    })

    test('should handle actions with multiple keywords', () => {
      expect(getSeverityForAction('USER_LOGIN_FAILED')).toBe('WARNING')
      expect(getCategoryForAction('USER_LOGIN_FAILED')).toBe('SECURITY')
    })

    test('should handle actions with partial matches', () => {
      expect(getSeverityForAction('PREFAILED')).toBe('WARNING')
      expect(getSeverityForAction('DELETEDPOST')).toBe('CRITICAL')
    })
  })
})
