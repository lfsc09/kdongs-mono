# Improvements & Recommendations

This document outlines potential improvements, enhancements, and best practices that could be implemented in the kdongs-mono repository. Items are categorized by priority and area of concern.

## Table of Contents
1. [Critical (Security & Stability)](#critical-security--stability)
2. [High Priority (User Experience & Performance)](#high-priority-user-experience--performance)
3. [Medium Priority (Developer Experience)](#medium-priority-developer-experience)
4. [Low Priority (Nice to Have)](#low-priority-nice-to-have)
5. [Future Features](#future-features)

---

## Critical (Security & Stability)

### 1. Security Enhancements

#### 1.1 Implement Refresh Tokens
**Current State**: Access tokens expire in 1 day with no refresh mechanism

**Recommendation**:
- Add refresh token flow with longer expiration (7-30 days)
- Store refresh tokens in database with revocation capability
- Implement token rotation on refresh
- Add endpoint: `POST /refresh` to exchange refresh token for new access token

**Benefits**:
- Better security (shorter-lived access tokens)
- Improved UX (no forced re-login)
- Token revocation capability

**Implementation**:
```typescript
// Backend: app/services/auth/auth_service.ts
async refresh(input: RefreshRequest): Promise<RefreshResponse> {
  const refreshToken = await RefreshToken.verify(input.refreshToken)
  const user = await User.find(refreshToken.userId)

  // Revoke old tokens
  await User.accessTokens.delete(user, refreshToken.accessTokenId)
  await refreshToken.delete()

  // Create new tokens
  const accessToken = await User.accessTokens.create(user, ['*'], {
    expiresIn: '15 minutes'
  })
  const newRefreshToken = await RefreshToken.create({
    userId: user.id,
    accessTokenId: accessToken.identifier,
    expiresAt: DateTime.now().plus({ days: 30 })
  })

  return { accessToken, refreshToken: newRefreshToken }
}
```

---

#### 1.2 Add Rate Limiting
**Current State**: No rate limiting on API endpoints

**Recommendation**:
- Install `@adonisjs/limiter` package
- Configure rate limits per endpoint:
  - Login: 5 requests per 15 minutes per IP
  - API endpoints: 100 requests per minute per user
  - Public endpoints: 50 requests per minute per IP

**Implementation**:
```typescript
// config/limiter.ts
export default {
  default: 'database',
  stores: {
    database: {
      driver: 'database',
      table: 'rate_limits'
    }
  }
}

// start/routes.ts
router.post('/login', '#controllers/auth/auth_controller.login')
  .middleware(throttle({ max: 5, duration: '15 minutes' }))
```

---

#### 1.3 Add Security Headers
**Current State**: Missing security headers (CSP, HSTS, X-Frame-Options)

**Recommendation**:
- Install `helmet` or configure security headers middleware
- Add headers:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

**Implementation**:
```typescript
// app/middleware/security_headers_middleware.ts
export default class SecurityHeadersMiddleware {
  async handle({ response }: HttpContext, next: NextFn) {
    response.header('X-Frame-Options', 'DENY')
    response.header('X-Content-Type-Options', 'nosniff')
    response.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    await next()
  }
}
```

---

#### 1.4 Implement Password Reset Flow
**Current State**: No password reset functionality

**Recommendation**:
- Add password reset endpoints:
  - `POST /password/forgot` - Request reset token
  - `POST /password/reset` - Reset with token
- Store reset tokens with expiration (1 hour)
- Send reset email with secure link
- Invalidate all existing tokens after password change

---

#### 1.5 Add Email Verification
**Current State**: Users can register without email verification

**Recommendation**:
- Add email verification flow
- Block access to sensitive features until verified
- Add `emailVerifiedAt` column to users table
- Send verification email on registration

---

### 2. Error Handling & Monitoring

#### 2.1 Centralized Error Logging
**Current State**: Basic error handling with Pino logger

**Recommendation**:
- Integrate error monitoring service (Sentry, Rollbar, or Bugsnag)
- Add structured error logging with context
- Implement error alerting for critical issues

**Implementation**:
```typescript
// Backend
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: env.get('SENTRY_DSN'),
  environment: env.get('NODE_ENV')
})

// app/exceptions/handler.ts
async report(error: unknown, ctx: HttpContext) {
  Sentry.captureException(error, {
    user: { id: ctx.auth.user?.id },
    extra: { url: ctx.request.url(), method: ctx.request.method() }
  })
}
```

```typescript
// Frontend
import * as Sentry from '@sentry/angular'

Sentry.init({
  dsn: environment.sentryDsn,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0
})
```

---

#### 2.2 Improve Error Messages
**Current State**: Generic error messages, inconsistent error format

**Recommendation**:
- Standardize error response format
- Add error codes for client-side handling
- Provide user-friendly messages with technical details
- Implement i18n for error messages

**Example Error Format**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "code": "REQUIRED_FIELD"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid-v7"
  }
}
```

---

#### 2.3 Add Request ID Tracking
**Current State**: No request correlation IDs

**Recommendation**:
- Generate unique request ID for each API call
- Include in response headers (`X-Request-ID`)
- Log with all related operations
- Use for debugging and error tracing

---

### 3. Database & Data Integrity

#### 3.1 Add Database Connection Pooling Configuration
**Current State**: Default connection pooling settings

**Recommendation**:
```typescript
// config/database.ts
postgres: {
  // ...
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  }
}
```

---

#### 3.2 Add Database Backups
**Current State**: No automated backup strategy

**Recommendation**:
- Implement automated daily backups
- Store backups in S3 or similar
- Test restore process regularly
- Document backup/restore procedures

---

#### 3.3 Add Soft Delete Scopes
**Current State**: Soft deletes implemented but no global scopes

**Recommendation**:
```typescript
// app/models/wallet.ts
export default class Wallet extends BaseModel {
  @beforeFind()
  static ignoreDeleted(query: ModelQueryBuilder<typeof Wallet>) {
    query.whereNull('deleted_at')
  }

  // Add method to include deleted records
  static withTrashed(query: ModelQueryBuilder<typeof Wallet>) {
    return query.withoutGlobalScope('ignoreDeleted')
  }
}
```

---

## High Priority (User Experience & Performance)

### 4. Performance Optimizations

#### 4.1 Implement Caching Strategy
**Current State**: No caching layer

**Recommendation**:
- Add Redis for caching
- Cache frequently accessed data:
  - User permissions
  - Currency exchange rates
  - Wallet aggregations
- Implement cache invalidation strategy
- Add cache-control headers for static assets

**Implementation**:
```typescript
// Backend
import redis from '@adonisjs/redis/services/main'

// Cache wallet list for 5 minutes
async walletsList(input: IndexRequest): Promise<IndexResponse> {
  const cacheKey = `wallets:${input.userId}:${input.page}:${input.limit}`
  const cached = await redis.get(cacheKey)

  if (cached) return JSON.parse(cached)

  const result = await this.fetchWallets(input)
  await redis.setex(cacheKey, 300, JSON.stringify(result))

  return result
}
```

---

#### 4.2 Add Database Query Optimization
**Current State**: N+1 queries possible in some endpoints

**Recommendation**:
- Review and optimize queries with `.preload()`
- Add database indexes for frequently queried columns
- Use query builder for complex queries
- Monitor slow queries

**Add Indexes**:
```typescript
// Migration
table.index('user_id')
table.index(['user_id', 'deleted_at'])
table.index('currency_code')
table.index(['wallet_id', 'date_utc'])
```

---

#### 4.3 Implement Lazy Loading for Frontend
**Current State**: Some modules lazily loaded, but could be improved

**Recommendation**:
- Lazy load all feature modules
- Implement component-level lazy loading
- Add loading skeletons for better UX
- Preload critical routes

---

#### 4.4 Add Pagination Limits
**Current State**: User can request unlimited page size

**Recommendation**:
```typescript
// app/validators/shared/pagination.ts
export const PaginationValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(), // ← Add max
    sortBy: vine.string().optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional()
  })
)
```

---

### 5. User Experience Improvements

#### 5.1 Add Loading States
**Current State**: Inconsistent loading indicators

**Recommendation**:
- Implement global loading service
- Add skeleton screens for data loading
- Show progress for long operations
- Disable buttons during submission

**Implementation**:
```typescript
// Frontend: infra/services/loading/loading.service.ts
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = signal(false)
  loading = this._loading.asReadonly()

  private activeRequests = 0

  start(): void {
    this.activeRequests++
    this._loading.set(true)
  }

  stop(): void {
    this.activeRequests--
    if (this.activeRequests <= 0) {
      this.activeRequests = 0
      this._loading.set(false)
    }
  }
}

// HTTP Interceptor
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService)
  loadingService.start()

  return next(req).pipe(
    finalize(() => loadingService.stop())
  )
}
```

---

#### 5.2 Improve Form Validation
**Current State**: Basic validation, limited user feedback

**Recommendation**:
- Add real-time validation feedback
- Show field-level error messages
- Add password strength indicator
- Implement custom validators

---

#### 5.3 Add Optimistic Updates
**Current State**: UI updates after server confirmation

**Recommendation**:
- Implement optimistic updates for better UX
- Rollback on server error
- Show sync status

---

#### 5.4 Add Empty States
**Current State**: May show empty lists without guidance

**Recommendation**:
- Add empty state components with CTAs
- Guide users on how to add first wallet
- Show helpful illustrations

---

#### 5.5 Add Confirmation Dialogs
**Current State**: Delete operations may lack confirmation

**Recommendation**:
- Add confirmation modal for destructive actions
- Require typing wallet name to confirm deletion
- Show impact of deletion (e.g., "This will delete 5 assets")

---

### 6. API Improvements

#### 6.1 Add API Versioning
**Current State**: No versioning strategy

**Recommendation**:
```typescript
// start/routes.ts
const v1 = router.group(() => {
  router.post('/login', '#controllers/auth/auth_controller.login')
  router.resource('wallets', '#controllers/investments/wallets_controller')
}).prefix('/api/v1')

const v2 = router.group(() => {
  // New version with breaking changes
}).prefix('/api/v2')
```

---

#### 6.2 Add OpenAPI/Swagger Documentation
**Current State**: No API documentation

**Recommendation**:
- Install `@adonisjs/swagger` or similar
- Generate OpenAPI spec from routes/validators
- Host interactive API docs at `/docs`
- Keep documentation in sync with code

**Example**:
```typescript
// @swagger
// tags:
//   - name: Authentication
// /login:
//   post:
//     summary: Authenticate user
//     tags: [Authentication]
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               email: { type: string, format: email }
//               password: { type: string, minLength: 8 }
```

---

#### 6.3 Implement HATEOAS
**Current State**: API responses lack links to related resources

**Recommendation**:
```json
{
  "data": {
    "wallet": {
      "id": "uuid",
      "name": "Portfolio",
      "_links": {
        "self": "/api/v1/wallets/uuid",
        "movements": "/api/v1/wallets/uuid/movements",
        "performance": "/api/v1/wallets/uuid/performance"
      }
    }
  }
}
```

---

#### 6.4 Add Bulk Operations
**Current State**: Operations are single-item only

**Recommendation**:
- Add bulk wallet deletion
- Add bulk asset import
- Implement batch API endpoints

---

## Medium Priority (Developer Experience)

### 7. Testing Improvements

#### 7.1 Increase Test Coverage
**Current State**: Minimal test coverage

**Recommendation**:
- Target 80%+ coverage for backend services
- Target 70%+ coverage for frontend components
- Add integration tests for critical flows
- Add E2E tests with Playwright or Cypress

**Backend Test Example**:
```typescript
// tests/unit/services/wallets_service.spec.ts
test.group('WalletsService', () => {
  test('walletsList returns paginated results', async ({ assert }) => {
    const service = new WalletsService()
    const user = await UserFactory.create()

    await WalletFactory.merge({ userId: user.id }).createMany(5)

    const result = await service.walletsList({
      userId: user.id,
      page: 1,
      limit: 10
    })

    assert.equal(result.data.wallets.length, 5)
    assert.equal(result.metadata.total, 5)
  })
})
```

**Frontend Test Example**:
```typescript
// src/app/pages/private/modules/investments/wallet/wallet.spec.ts
describe('WalletComponent', () => {
  it('should display wallets', async () => {
    const fixture = TestBed.createComponent(WalletComponent)
    const gateway = TestBed.inject(InvestmentsGatewayService)

    spyOn(gateway, 'listUserWallets').and.returnValue(of({
      data: { wallets: [mockWallet] },
      metadata: { total: 1 }
    }))

    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain(mockWallet.name)
  })
})
```

---

#### 7.2 Add E2E Tests
**Current State**: No end-to-end tests

**Recommendation**:
- Install Playwright or Cypress
- Test critical user flows:
  - Login → Create wallet → Add investment → View performance
  - Logout → Login with wrong credentials (error handling)

**Example**:
```typescript
// e2e/auth.spec.ts
test('user can login and see wallets', async ({ page }) => {
  await page.goto('http://localhost:4200/gate')

  await page.fill('input[name=email]', 'test@example.com')
  await page.fill('input[name=password]', 'password123')
  await page.click('button[type=submit]')

  await expect(page).toHaveURL(/r!\/investments/)
  await expect(page.locator('h1')).toContainText('Wallets')
})
```

---

#### 7.3 Add Test Data Factories
**Current State**: Manual test data creation

**Recommendation**:
```typescript
// database/factories/wallet_factory.ts
export const WalletFactory = factory
  .define(Wallet, ({ faker }) => {
    return {
      name: faker.finance.accountName(),
      currencyCode: faker.helpers.arrayElement(['USD', 'BRL', 'EUR'])
    }
  })
  .build()
```

---

### 8. Code Quality & Consistency

#### 8.1 Add ESLint Rules (Frontend)
**Current State**: Only Prettier for frontend

**Recommendation**:
- Add ESLint with Angular rules
- Configure rules:
  - `@angular-eslint/recommended`
  - `@typescript-eslint/recommended`
  - `no-console` (except error/warn)
  - `prefer-const`
  - `no-var`

---

#### 8.2 Standardize Naming Conventions
**Current State**: Mostly consistent, but some variations

**Recommendation**:
- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Methods**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private members**: `_prefixed`
- **Database columns**: `snake_case`

---

#### 8.3 Add Code Comments
**Current State**: Minimal inline documentation

**Recommendation**:
- Add JSDoc comments for public APIs
- Document complex business logic
- Add "why" comments for non-obvious code

**Example**:
```typescript
/**
 * Calculates portfolio performance including profit/loss and percentage returns.
 *
 * The calculation includes:
 * - Current balance (submissions + profit)
 * - Profit in wallet currency
 * - Profit percentage based on total submissions
 *
 * @param walletIds - Array of wallet UUIDs to calculate performance for
 * @returns Performance metrics with series data for charting
 */
async calculatePerformance(walletIds: string[]): Promise<PerformanceResponse>
```

---

#### 8.4 Extract Magic Numbers/Strings
**Current State**: Some hardcoded values

**Recommendation**:
```typescript
// config/constants.ts
export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '1 day',
  REFRESH_TOKEN_EXPIRY: '30 days',
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT_MINUTES: 15
} as const

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const
```

---

### 9. DevOps & Deployment

#### 9.1 Complete Docker Setup
**Current State**: Docker folder is WIP

**Recommendation**:
- Create production-ready Docker setup
- Add multi-stage builds
- Optimize image sizes
- Add health checks

**Example**:
```dockerfile
# packages/backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3333
CMD ["node", "build/bin/server.js"]
```

---

#### 9.2 Add CI/CD Pipeline
**Current State**: No automated CI/CD

**Recommendation**:
- Add GitHub Actions workflow
- Steps:
  1. Lint (Biome + Prettier)
  2. Type check (tsc)
  3. Run tests
  4. Build
  5. Deploy (if main branch)

**Example**:
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run dev:backend:format
      - run: npm run dev:frontend:format
      - run: npm run test:backend
      - run: npm run test:frontend
      - run: npm run build:backend
      - run: npm run build:frontend
```

---

#### 9.3 Add Environment Management
**Current State**: Manual .env files

**Recommendation**:
- Use environment management tool (dotenv-vault, Doppler)
- Separate environments: dev, staging, production
- Secret rotation strategy
- Document all required variables

---

#### 9.4 Add Health Check Endpoint
**Current State**: No health check

**Recommendation**:
```typescript
// start/routes.ts
router.get('/health', async ({ response }) => {
  try {
    // Check database connection
    await Database.rawQuery('SELECT 1')

    return response.ok({
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      database: 'connected'
    })
  } catch (error) {
    return response.serviceUnavailable({
      status: 'unhealthy',
      error: error.message
    })
  }
})
```

---

### 10. Documentation

#### 10.1 Add Inline Code Documentation
**Current State**: Minimal documentation in code

**Recommendation**:
- Add JSDoc comments for all public APIs
- Document complex business logic
- Add README files in major directories

---

#### 10.2 Create Developer Onboarding Guide
**Current State**: README covers setup, but not development workflow

**Recommendation**:
- Add `CONTRIBUTING.md` with:
  - Code style guidelines
  - Git workflow
  - PR template
  - How to run tests
  - How to add new features

---

#### 10.3 Add Architecture Decision Records (ADRs)
**Current State**: No documentation of architectural decisions

**Recommendation**:
- Create `docs/adr/` directory
- Document major decisions:
  - Why AdonisJS over NestJS?
  - Why Signals over NgRx?
  - Why UUID v7 over auto-increment?
  - Why HTTP-only cookies for auth?

---

## Low Priority (Nice to Have)

### 11. Feature Enhancements

#### 11.1 Add Multi-Language Support (i18n)
**Recommendation**:
- Backend: Add `@adonisjs/i18n`
- Frontend: Add `@angular/localize` or `ngx-translate`
- Support: English, Portuguese (Brazilian)

---

#### 11.2 Add Dark Mode
**Current State**: ThemeManagerService exists but incomplete

**Recommendation**:
- Complete dark mode implementation
- Add theme toggle in UI
- Persist preference in localStorage
- Support system preference (`prefers-color-scheme`)

---

#### 11.3 Add Export Functionality
**Recommendation**:
- Export wallet data to CSV/Excel
- Export performance reports to PDF
- Add date range filters for exports

---

#### 11.4 Add Data Visualization
**Recommendation**:
- Install charting library (Chart.js, ApexCharts, Highcharts)
- Add performance charts:
  - Portfolio value over time
  - Profit/loss trends
  - Asset allocation pie chart
  - Currency distribution

---

#### 11.5 Add Notifications System
**Recommendation**:
- In-app notifications
- Email notifications (price alerts, performance reports)
- Push notifications (PWA)
- WebSocket for real-time updates

---

#### 11.6 Add User Profile Management
**Recommendation**:
- Edit profile (name, email)
- Change password
- Manage sessions (view/revoke active sessions)
- Account deletion

---

#### 11.7 Add Import Functionality
**Recommendation**:
- Import transactions from CSV
- Import from brokerage reports
- Bulk asset creation

---

#### 11.8 Add Search & Filters
**Recommendation**:
- Search wallets by name
- Filter by currency
- Filter by date range
- Sort by multiple columns

---

### 12. Progressive Web App (PWA)

#### 12.1 Add Service Worker
**Recommendation**:
- Configure Angular PWA
- Cache API responses for offline access
- Add install prompt
- Add app manifest

---

#### 12.2 Add Offline Support
**Recommendation**:
- Queue mutations for sync when online
- Show offline indicator
- Cache critical data

---

### 13. Monitoring & Analytics

#### 13.1 Add Application Performance Monitoring (APM)
**Recommendation**:
- Install New Relic, DataDog, or similar
- Monitor:
  - API response times
  - Database query performance
  - Frontend render times
  - Error rates

---

#### 13.2 Add User Analytics
**Recommendation**:
- Google Analytics or Plausible
- Track:
  - User flows
  - Feature usage
  - Conversion funnels
  - Error occurrences

---

#### 13.3 Add Database Query Monitoring
**Recommendation**:
- Log slow queries (> 100ms)
- Monitor connection pool usage
- Track most frequent queries

---

## Future Features

### 14. Planned Features (from Roadmap)

Based on the README roadmap:

#### 14.1 Market Ticker Data
- Real-time stock prices
- Currency exchange rates
- Asset price history

#### 14.2 Investment Calculators
- Compound interest calculator
- Retirement planning
- Tax estimation

#### 14.3 Price Tracking & Warnings
- Set price alerts
- Email/push notifications
- Threshold monitoring

---

### 15. Additional Feature Ideas

#### 15.1 Multi-User Features
- Family accounts (shared wallets)
- Advisor access (read-only sharing)
- Collaboration features

#### 15.2 Advanced Analytics
- Risk analysis
- Diversification metrics
- Benchmark comparison (vs S&P 500, etc.)
- Tax loss harvesting suggestions

#### 15.3 Integration with External Services
- Brokerage account sync (Plaid, Yodlee)
- Bank account integration
- Tax reporting integration

#### 15.4 Mobile App
- React Native or Flutter app
- Native features (biometric auth, push notifications)
- Offline-first architecture

---

## Implementation Priority Matrix

| Priority | Category | Estimated Effort | Impact |
|----------|----------|------------------|--------|
| **P0** | Security (Refresh Tokens, Rate Limiting) | Medium | High |
| **P0** | Error Monitoring (Sentry) | Low | High |
| **P0** | Test Coverage (80%+) | High | High |
| **P1** | Caching Strategy (Redis) | Medium | High |
| **P1** | API Documentation (OpenAPI) | Medium | Medium |
| **P1** | CI/CD Pipeline | Medium | High |
| **P2** | Dark Mode (Complete) | Low | Low |
| **P2** | i18n Support | Medium | Medium |
| **P2** | Data Visualization | Medium | High |
| **P3** | PWA Features | Medium | Medium |
| **P3** | Mobile App | High | High |

---

## Conclusion

This improvements document provides a comprehensive roadmap for enhancing the kdongs-mono application across security, performance, user experience, and feature completeness. Prioritize items based on:

1. **Security & Stability** (P0) - Critical for production readiness
2. **User Experience & Performance** (P1) - High impact on user satisfaction
3. **Developer Experience** (P2) - Improves maintainability and velocity
4. **Nice to Have** (P3) - Enhances product competitiveness

Implement improvements incrementally, measuring impact at each stage. Focus on high-impact, low-effort items first (quick wins) while planning for larger initiatives.
