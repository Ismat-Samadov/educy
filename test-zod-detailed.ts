import { z } from 'zod'

// Test each pattern separately
console.log('=== Testing z.string().url().nullable() ===')
const schema1 = z.string().url().nullable()
try {
  console.log('null:', schema1.parse(null))
} catch (e) {
  console.log('null FAILED:', (e as z.ZodError).errors[0].message)
}
try {
  console.log('URL:', schema1.parse('https://example.com'))
} catch (e) {
  console.log('URL FAILED:', (e as z.ZodError).errors[0].message)
}

console.log('\n=== Testing z.string().url().optional().nullable() ===')
const schema2 = z.string().url().optional().nullable()
try {
  console.log('null:', schema2.parse(null))
} catch (e) {
  console.log('null FAILED:', (e as z.ZodError).errors[0].message)
}
try {
  console.log('undefined:', schema2.parse(undefined))
} catch (e) {
  console.log('undefined FAILED:', (e as z.ZodError).errors[0].message)
}
try {
  console.log('URL:', schema2.parse('https://example.com'))
} catch (e) {
  console.log('URL FAILED:', (e as z.ZodError).errors[0].message)
}

console.log('\n=== Testing z.union([z.string().url(), z.null()]) ===')
const schema3 = z.union([z.string().url(), z.null()])
try {
  console.log('null:', schema3.parse(null))
} catch (e) {
  console.log('null FAILED:', (e as z.ZodError).errors[0].message)
}
try {
  console.log('URL:', schema3.parse('https://example.com'))
} catch (e) {
  console.log('URL FAILED:', (e as z.ZodError).errors[0].message)
}

console.log('\n=== Testing with preprocess ===')
const schema4 = z.preprocess(
  (val) => (val === '' ? null : val),
  z.string().url().nullable()
)
try {
  console.log('empty string:', schema4.parse(''))
} catch (e) {
  console.log('empty string FAILED:', (e as z.ZodError).errors[0].message)
}
try {
  console.log('null:', schema4.parse(null))
} catch (e) {
  console.log('null FAILED:', (e as z.ZodError).errors[0].message)
}

const schema5 = z.preprocess(
  (val) => (val === '' ? null : val),
  z.union([z.string().url(), z.null()])
)
try {
  console.log('[UNION] empty string:', schema5.parse(''))
} catch (e) {
  console.log('[UNION] empty string FAILED:', (e as z.ZodError).errors[0].message)
}
try {
  console.log('[UNION] null:', schema5.parse(null))
} catch (e) {
  console.log('[UNION] null FAILED:', (e as z.ZodError).errors[0].message)
}
