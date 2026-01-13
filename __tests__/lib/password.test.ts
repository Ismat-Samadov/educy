import { generatePassword } from '@/lib/password'

describe('Password Utility', () => {
  describe('generatePassword', () => {
    test('should generate password with default length of 12', () => {
      const password = generatePassword()
      expect(password).toHaveLength(12)
    })

    test('should generate password with custom length', () => {
      const password = generatePassword(16)
      expect(password).toHaveLength(16)
    })

    test('should generate password with minimum length of 4 (for all categories)', () => {
      const password = generatePassword(4)
      expect(password).toHaveLength(4)
    })

    test('should contain at least one uppercase letter', () => {
      const password = generatePassword(12)
      expect(password).toMatch(/[A-Z]/)
    })

    test('should contain at least one lowercase letter', () => {
      const password = generatePassword(12)
      expect(password).toMatch(/[a-z]/)
    })

    test('should contain at least one number', () => {
      const password = generatePassword(12)
      expect(password).toMatch(/[0-9]/)
    })

    test('should contain at least one special character', () => {
      const password = generatePassword(12)
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
    })

    test('should generate unique passwords', () => {
      const passwords = new Set()
      for (let i = 0; i < 100; i++) {
        passwords.add(generatePassword())
      }
      // All 100 passwords should be unique
      expect(passwords.size).toBe(100)
    })

    test('should generate different passwords on consecutive calls', () => {
      const password1 = generatePassword()
      const password2 = generatePassword()
      expect(password1).not.toBe(password2)
    })

    test('should generate strong passwords with all character types', () => {
      const password = generatePassword(20)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[0-9]/)
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
      expect(password).toHaveLength(20)
    })

    test('should handle edge case with very long password', () => {
      const password = generatePassword(100)
      expect(password).toHaveLength(100)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[0-9]/)
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
    })
  })
})
