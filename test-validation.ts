import { z } from 'zod'

// Test what happens when we send empty string vs null
const testData = {
  platformName: 'Hedef',
  platformLogoUrl: 'https://admin.hedefglobal.az/storage/uploads/image.jpg',
  systemEmailFrom: 'noreply@educy.com',
  systemEmailName: 'Educy Platform',
  passwordMinLength: 8,
  passwordRequireUpper: true,
  passwordRequireLower: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: false,
  maxUploadSizeMB: 10,
  enableCaseRooms: true,
  enableExams: true,
  enableCertificates: true,
  enablePayments: true,
  maxEnrollmentsPerStudent: 5,
}

// Simulating what happens when form fields are cleared
const clearedData = {
  platformName: 'Hedef',
  platformLogoUrl: null,
  systemEmailFrom: null,
  systemEmailName: null,
  passwordMinLength: 8,
  passwordRequireUpper: true,
  passwordRequireLower: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: false,
  maxUploadSizeMB: 10,
  enableCaseRooms: true,
  enableExams: true,
  enableCertificates: true,
  enablePayments: true,
  maxEnrollmentsPerStudent: null,
}

// Test with broken schema
const brokenSchema = z.object({
  platformName: z.string().min(1).max(50).optional(),
  platformLogoUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url().optional().nullable()
  ),
  systemEmailFrom: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().email().optional().nullable()
  ),
  systemEmailName: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().min(1).max(100).optional().nullable()
  ),
  passwordMinLength: z.number().min(6).max(32).optional(),
  passwordRequireUpper: z.boolean().optional(),
  passwordRequireLower: z.boolean().optional(),
  passwordRequireNumber: z.boolean().optional(),
  passwordRequireSpecial: z.boolean().optional(),
  maxUploadSizeMB: z.number().min(1).max(100).optional(),
  enableCaseRooms: z.boolean().optional(),
  enableExams: z.boolean().optional(),
  enableCertificates: z.boolean().optional(),
  enablePayments: z.boolean().optional(),
  maxEnrollmentsPerStudent: z.number().min(1).max(20).optional().nullable(),
})

// Test with fixed schema
const fixedSchema = z.object({
  platformName: z.string().min(1).max(50).optional(),
  platformLogoUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().url(), z.null()]).optional()
  ),
  systemEmailFrom: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().email(), z.null()]).optional()
  ),
  systemEmailName: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().min(1).max(100), z.null()]).optional()
  ),
  passwordMinLength: z.number().min(6).max(32).optional(),
  passwordRequireUpper: z.boolean().optional(),
  passwordRequireLower: z.boolean().optional(),
  passwordRequireNumber: z.boolean().optional(),
  passwordRequireSpecial: z.boolean().optional(),
  maxUploadSizeMB: z.number().min(1).max(100).optional(),
  enableCaseRooms: z.boolean().optional(),
  enableExams: z.boolean().optional(),
  enableCertificates: z.boolean().optional(),
  enablePayments: z.boolean().optional(),
  maxEnrollmentsPerStudent: z.preprocess(
    (val) => (val === 0 || val === '' ? null : val),
    z.union([z.number().min(1).max(20), z.null()]).optional()
  ),
})

console.log('Testing with FULL data:')
console.log('=======================')
try {
  const result1 = brokenSchema.parse(testData)
  console.log('✓ Broken schema passed with full data')
} catch (error) {
  console.log('✗ Broken schema failed with full data:', error instanceof z.ZodError ? error.errors : error)
}

try {
  const result2 = fixedSchema.parse(testData)
  console.log('✓ Fixed schema passed with full data')
} catch (error) {
  console.log('✗ Fixed schema failed with full data:', error instanceof z.ZodError ? error.errors : error)
}

console.log('\nTesting with CLEARED (null) data:')
console.log('==================================')
try {
  const result3 = brokenSchema.parse(clearedData)
  console.log('✓ Broken schema passed with cleared data')
} catch (error) {
  console.log('✗ Broken schema failed with cleared data:')
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.log(`  - Field: ${err.path.join('.')}, Error: ${err.message}`)
    })
  }
}

try {
  const result4 = fixedSchema.parse(clearedData)
  console.log('✓ Fixed schema passed with cleared data')
} catch (error) {
  console.log('✗ Fixed schema failed with cleared data:')
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.log(`  - Field: ${err.path.join('.')}, Error: ${err.message}`)
    })
  }
}
