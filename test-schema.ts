import { z } from 'zod'

// Test the old broken schema
const brokenSchema = z.object({
  platformLogoUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url().optional().nullable()
  ),
  systemEmailFrom: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().email().optional().nullable()
  ),
})

// Test the new fixed schema
const fixedSchema = z.object({
  platformLogoUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().url(), z.null()]).optional()
  ),
  systemEmailFrom: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().email(), z.null()]).optional()
  ),
})

// Test data
const testCases = [
  { platformLogoUrl: '', systemEmailFrom: '' },
  { platformLogoUrl: null, systemEmailFrom: null },
  { platformLogoUrl: 'https://example.com/logo.png', systemEmailFrom: 'test@example.com' },
]

console.log('Testing BROKEN schema:')
testCases.forEach((testCase, i) => {
  try {
    const result = brokenSchema.parse(testCase)
    console.log(`✓ Test ${i + 1} passed:`, result)
  } catch (error) {
    console.log(`✗ Test ${i + 1} failed:`, error instanceof z.ZodError ? error.errors[0].message : error)
  }
})

console.log('\nTesting FIXED schema:')
testCases.forEach((testCase, i) => {
  try {
    const result = fixedSchema.parse(testCase)
    console.log(`✓ Test ${i + 1} passed:`, result)
  } catch (error) {
    console.log(`✗ Test ${i + 1} failed:`, error instanceof z.ZodError ? error.errors[0].message : error)
  }
})
