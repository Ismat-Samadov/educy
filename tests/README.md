# Educy Testing Suite

This directory contains bash-based integration and functional tests for the Educy platform. For modern unit and E2E tests, see the main [Testing Documentation](../docs/TESTING_DOCUMENTATION.md).

## Available Test Scripts

### 1. Static Verification (`static-verification.sh`)

**Purpose**: Verify code structure, security patterns, and configurations without running the app.

**Tests**: 67 checks including:
- Build verification
- File structure validation
- Security pattern verification
- Configuration checks
- Database schema validation

**Run**:
```bash
./tests/static-verification.sh
# or
npm run test:static
```

**Requirements**: None (no running server needed)

**Duration**: ~5 seconds

---

### 2. Live Integration Test (`live-integration-test.sh`)

**Purpose**: Verify external service integrations and API endpoint availability.

**Tests**: 27 integration tests including:
- Database connectivity
- Cloudflare R2 file storage
- Google Gemini AI API
- Resend email service
- NextAuth authentication
- API endpoint availability

**Run**:
```bash
# Start dev server in one terminal
npm run dev

# Run tests in another terminal
./tests/live-integration-test.sh
```

**Requirements**: Running dev server on http://localhost:3000

**Duration**: ~10 seconds

---

### 3. Comprehensive Functional Tests (`comprehensive-functional-tests.sh`)

**Purpose**: Full end-to-end functional testing of all major features with real API calls.

**Tests**: 30+ comprehensive tests covering:
- Environment validation
- Authentication & authorization
- Admin user management
- Input validation
- Role-based access control
- Course management
- Database consistency
- Security verification
- Race condition prevention
- File structure & build

**Run**:
```bash
# Start dev server
npm run dev

# Set admin password and run tests
export ADMIN_PASSWORD="admin123"
./tests/comprehensive-functional-tests.sh
# or
npm run test:functional
```

**Requirements**:
- Running dev server on http://localhost:3000
- `ADMIN_PASSWORD` environment variable set
- Valid database connection
- All external services configured

**Duration**: ~60 seconds

---

### 4. API Test Suite (`api-test-suite.sh`)

**Purpose**: Comprehensive API endpoint testing.

**Run**:
```bash
npm run dev
./tests/api-test-suite.sh
```

**Requirements**: Running dev server

---

### 5. Run All Tests (`run-all-tests.sh`)

**Purpose**: Execute complete test suite in sequence.

**Run**:
```bash
# Start dev server
npm run dev

# In another terminal
export ADMIN_PASSWORD="admin123"
./tests/run-all-tests.sh
# or
npm run test:all
```

**Includes**:
1. Static verification tests
2. Comprehensive functional tests

**Duration**: ~90 seconds total

---

## Test Results Storage

Test results are saved in timestamped directories:
- `test-results-YYYYMMDD_HHMMSS/` - Functional test outputs
- Individual response and header files for debugging

---

## Environment Variables

### Required for Full Testing

```bash
# Admin credentials
export ADMIN_PASSWORD="your_admin_password"

# Base URL (optional, defaults to http://localhost:3000)
export BASE_URL="http://localhost:3000"

# Admin email (optional, defaults to admin@educy.com)
export ADMIN_EMAIL="admin@educy.com"
```

---

## Understanding Test Output

### Success Example
```
════════════════════════════════════════════════════════════
   EDUCY - STATIC CODE VERIFICATION
════════════════════════════════════════════════════════════

✓ PASS - Build completes successfully
✓ PASS - TypeScript compilation successful
✓ PASS - Environment file exists

...

════════════════════════════════════════════════════════════
   TEST SUMMARY
════════════════════════════════════════════════════════════

Total Tests:  67
Passed:       67
Failed:       0
Success Rate: 100%
```

### Failure Example
```
✗ FAIL - API endpoint returns correct status
  Details: Expected: 200, Got: 401
```

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with connection errors
**Solution**: Ensure dev server is running on port 3000

**Issue**: Authentication tests fail
**Solution**: Set `ADMIN_PASSWORD` environment variable correctly

**Issue**: Database tests fail
**Solution**: Verify `DATABASE_URL` in `.env` and database is accessible

**Issue**: Integration tests fail for external services
**Solution**: Check all API keys and credentials in `.env`:
- `GEMINI_API_KEY` for AI features
- `R2_*` variables for file storage
- `RESEND_API_KEY` for email
- `DATABASE_URL` for database

### Debug Mode

For more detailed output, you can modify the scripts:
```bash
# Add verbose mode
set -x  # At the start of the script

# Or run with bash debug
bash -x ./tests/static-verification.sh
```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run static tests
        run: npm run test:static
      
      - name: Run unit tests
        run: npm test
      
      - name: Build application
        run: npm run build
```

---

## Writing New Tests

### Bash Test Template

```bash
#!/bin/bash

# Test Description
test_my_feature() {
    local expected="success"
    local result=$(curl -s http://localhost:3000/api/endpoint)
    
    if [ "$result" = "$expected" ]; then
        print_test "PASS" "Feature works correctly"
    else
        print_test "FAIL" "Feature failed" "Expected: $expected, Got: $result"
    fi
}

# Run test
test_my_feature
```

---

## Best Practices

1. **Always run static tests first** - They're fast and catch basic issues
2. **Use a separate database for testing** - Avoid affecting production data
3. **Clean up test data** - Some tests create users/courses, clean up after
4. **Check environment** - Ensure all required env vars are set
5. **Read error messages** - They often contain the solution
6. **Run tests before commits** - Catch issues early

---

## Additional Testing

For modern testing approaches, see:

- **Unit Tests**: `npm test` (Jest tests in `__tests__/`)
- **E2E Tests**: `npm run test:e2e` (Playwright tests in `e2e/`)
- **Coverage**: `npm run test:coverage` (Generate coverage report)

See [Complete Testing Documentation](../docs/TESTING_DOCUMENTATION.md) for details.

---

## Support

For issues or questions about tests:
1. Check the [Testing Documentation](../docs/TESTING_DOCUMENTATION.md)
2. Review [Test Coverage Report](../docs/TEST_COVERAGE_REPORT.md)
3. Examine test output for specific error messages
4. Verify environment configuration

---

Last Updated: January 13, 2026
