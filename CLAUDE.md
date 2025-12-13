# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**kdongs-mono** is a TypeScript monorepo for personal finance management, specifically focused on investment portfolio tracking. It consists of:
- **Backend**: AdonisJS 6.x REST API with PostgreSQL
- **Frontend**: Angular 21.x SPA with Tailwind CSS

The application supports wallet management, Brazilian investment tracking (SEFBFR stocks, public/private bonds), multi-currency portfolios, and performance analytics.

---

## Monorepo Structure

This is an npm workspaces monorepo with two main packages:

```
kdongs-mono/
├── packages/
│   ├── backend/          # AdonisJS API
│   └── frontend/         # Angular SPA
├── package.json          # Root workspace configuration
└── ARCHITECTURE.md       # Detailed architecture documentation
```

All commands should be run from the **root directory** unless specified otherwise.

---

## Essential Commands

### Initial Setup

```bash
# Install all dependencies
npm install

# Backend: Create .env files and generate APP_KEY + DB credentials
npm run dev:setup

# Start PostgreSQL database
npm run dev:backend:docker-db-up

# Run migrations for development database
npm run dev:backend:migrate

# Run migrations for test database
npm run test:backend:migrate
```

### Development

```bash
# Run both frontend and backend concurrently (recommended)
npm run dev:mono

# Run individually
npm run dev:frontend    # Angular dev server on http://localhost:4200
npm run dev:backend     # AdonisJS dev server on http://localhost:3333
```

### Testing

```bash
# Backend tests (requires test DB migration first)
npm run test:backend:migrate   # Run once, or after schema changes
npm run test:backend

# Frontend tests
npm run test:frontend
```

### Code Quality

```bash
# Backend: Biome formatter/linter
npm run dev:backend:format

# Frontend: Prettier formatter
npm run dev:frontend:format
```

### Database Management

```bash
# Fresh migration with seeds (development)
npm run dev:backend:migrate

# Fresh migration without seeds (test)
npm run test:backend:migrate

# Tear down database (deletes all data)
npm run dev:backend:docker-db-down
```

### Backend-Specific Commands (from root)

```bash
# Run specific test file
npm run test:backend -- tests/functional/wallets.spec.ts

# Type checking
npm run typecheck --workspace backend

# Build for production
npm run build --workspace backend
```

### Frontend-Specific Commands (from root)

```bash
# Type checking
npm run ng typecheck --workspace frontend

# Build for production
npm run build --workspace frontend

# Run tests in watch mode
npm run test --workspace frontend -- --watch
```

---

## Architecture Patterns

### Backend (AdonisJS)

**Layered Architecture**:
1. **Routes** (`start/routes.ts`) - HTTP endpoint definitions
2. **Controllers** (`app/controllers/`) - Request/response handling, thin layer
3. **Services** (`app/services/`) - Business logic, database operations
4. **Models** (`app/models/`) - Lucid ORM entities with relationships
5. **Validators** (`app/validators/`) - Vine schema validation
6. **DTOs** (`app/core/dto/`) - Type-safe request/response contracts

**Key Patterns**:
- **Dependency Injection**: Use `@inject()` decorator on controllers to inject services
- **UUID Primary Keys**: All models use UUID v7 (via `uuidv7()` in `@beforeCreate` hooks)
- **Soft Deletes**: Models include `deletedAt` timestamp for soft deletion
- **Middleware Pipeline**: Cookie → Auth → Bouncer → Controller
- **Authorization**: Bouncer abilities (`anyUser`, `onlyAdmin`, `onlyUser`) in `app/abilities/main.ts`

**Important Notes**:
- All API endpoints (except `/login`) require authentication via HTTP-only cookie
- The `CookieToAuthHeaderMiddleware` converts cookies to `Authorization` headers
- Frontend permissions are role-based: `frontendPermissionsbyUserRole` in auth service
- Migrations use separate databases for `.env` (dev) and `.env.test` (testing)

**Path Aliases** (in `package.json` imports):
```typescript
import WalletsController from '#controllers/investments/wallets_controller.js'
import WalletsService from '#services/investments/wallets_service.js'
import Wallet from '#models/wallet.js'
import { IndexValidator } from '#validators/investments/wallet/index_validator.js'
```

### Frontend (Angular)

**Layered Architecture**:
1. **Pages** (`src/app/pages/`) - Route components (public/private)
2. **Components** (`pages/{public,private}/components/`) - UI components
3. **Services** (`src/app/infra/services/`) - State management with signals
4. **Gateways** (`src/app/infra/gateways/`) - API communication layer
5. **Guards** (`src/app/infra/guards/`) - Route protection

**Key Patterns**:
- **Standalone Components**: All components use `standalone: true` (default in Angular 21)
- **Signal-Based State**: Use `signal()`, `computed()`, and `effect()` instead of RxJS subjects
- **Gateway Pattern**: All HTTP calls go through gateway services that validate responses with Zod
- **Lazy Loading**: Feature routes use `loadComponent()` for code splitting

**Important Angular 21+ Rules**:
- Do NOT set `standalone: true` (it's the default)
- Do NOT use `@HostBinding`/`@HostListener` decorators (use `host` object instead)
- Use `input()` and `output()` functions instead of `@Input`/`@Output` decorators
- Use native control flow (`@if`, `@for`, `@switch`) instead of structural directives
- Do NOT use `ngClass`/`ngStyle` (use class/style bindings instead)
- Use `inject()` function instead of constructor injection
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on all components

**State Management**:
```typescript
// Services use signals for reactive state
@Injectable({ providedIn: 'root' })
export class WalletService {
  selectedWallets = signal<Map<string, Wallet>>(new Map())

  // Computed values
  totalBalance = computed(() =>
    Array.from(this.selectedWallets().values())
      .reduce((sum, w) => sum + w.balance, 0)
  )
}
```

**Gateway Pattern**:
```typescript
// All gateways extend DefaultGatewayService
export class InvestmentsGatewayService extends DefaultGatewayService {
  listUserWallets(request: ListWalletsRequest): Observable<ListWalletsResponse> {
    return this._httpClient
      .get<unknown>(`${this._apiUrl}/investments/wallets`, { params })
      .pipe(
        map(response => ListWalletsResponseSchema.parse(response)), // Zod validation
        catchError(this._handleError.bind(this))
      )
  }
}
```

**Route Structure**:
- `/gate` - Public login page
- `/r!` - Authenticated app shell
  - `/r!/investments` - Investment management module (lazy-loaded)

**Authentication Flow**:
1. Login sets HTTP-only cookie with token
2. `IdentityService` stores user data in signal + localStorage (keyed by hostname)
3. `gatekeeperGuard` protects routes and redirects unauthenticated users
4. Token expiration validated client-side before each navigation

---

## Type Safety & Validation

### Backend (Vine)
```typescript
// Validators in app/validators/
export const StoreValidator = vine.compile(
  vine.object({
    name: vine.string(),
    currencyCode: vine.enum(['USD', 'BRL', 'EUR'])
  })
)

export type StoreRequest = Infer<typeof StoreValidator>
```

### Frontend (Zod)
```typescript
// Schemas in gateways for runtime validation
const WalletSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  currencyCode: z.enum(['USD', 'BRL', 'EUR'])
})

type Wallet = z.infer<typeof WalletSchema>
```

---

## Authentication & Authorization

### Backend
- **Password Hashing**: Scrypt (configured in User model)
- **Token Storage**: HTTP-only cookies (1-day expiration)
- **Middleware Stack**: `ForceJsonResponse → CookieToAuthHeader → Auth → InitializeBouncer`
- **Abilities**: Defined in `app/abilities/main.ts`
  - `anyUser` - Both user and admin roles
  - `onlyAdmin` - Admin role only
  - `onlyUser` - User role only

### Frontend
- **Token Management**: `IdentityService` handles token validation and storage
- **Route Guards**: `gatekeeperGuard` redirects based on authentication status
- **Permissions**: Stored in signal as `allowedIn: string[]` (e.g., `['INVESTMENTS_ACCESS']`)

---

## Database

### PostgreSQL Setup
- **Development**: Runs in Docker container (port 5432)
- **Two Databases**: Separate DBs for `.env` (kdongs) and `.env.test` (kdongs_test)
- **Migrations**: Timestamped files in `database/migrations/`
- **Seeders**: Test data in `database/seeders/` (only for dev DB)

### Model Conventions
- **Primary Keys**: UUID v7 (auto-generated in `@beforeCreate` hook)
- **Timestamps**: `createdAt`, `updatedAt` (auto-managed by Lucid)
- **Soft Deletes**: `deletedAt` nullable timestamp
- **Naming**: Snake case in DB, camel case in models (Lucid handles conversion)

---

## Testing

### Backend (Japa)
- **Structure**: `tests/unit/` and `tests/functional/`
- **Database**: Uses separate test database (requires `npm run test:backend:migrate`)
- **Isolation**: Each test creates its own data, no seeding
- **API Testing**: Uses `@japa/api-client` for HTTP assertions

### Frontend (Vitest)
- **Structure**: `*.spec.ts` files co-located with components/services
- **Environment**: jsdom for DOM simulation
- **Testing Utilities**: Angular TestBed + Vitest matchers

---

## Pre-commit Hooks

**Husky + lint-staged** automatically formats code before commits:
- **Backend**: Biome checks `packages/backend/**/*.{ts,js,json,env,md}`
- **Frontend**: Prettier formats `packages/frontend/src/**/*.{ts,js,json,css,scss,html,md}`

---

## Common Development Workflows

### Adding a New API Endpoint

1. Define route in `start/routes.ts`
2. Create controller method in `app/controllers/`
3. Create service method in `app/services/`
4. Create validator in `app/validators/`
5. Define DTOs in `app/core/dto/`
6. Add authorization check with Bouncer abilities
7. Write functional tests in `tests/functional/`

### Adding a New Frontend Feature

1. Create component in `pages/private/modules/{feature}/`
2. Define routes in `{feature}.routes.ts`
3. Create service for state management (signals)
4. Create gateway service for API calls (with Zod schemas)
5. Add route to parent module
6. Write component/service tests

### Database Schema Changes

1. Create migration: `node ace make:migration {name}` (in packages/backend)
2. Define `up()` and `down()` methods
3. Update corresponding model in `app/models/`
4. Run migration: `npm run dev:backend:migrate` (from root)
5. Update test DB: `npm run test:backend:migrate`
6. Update validators/DTOs if needed

---

## Important File Locations

### Backend
- **Routes**: `start/routes.ts`
- **Middleware Config**: `start/kernel.ts`
- **Environment Validation**: `start/env.ts`
- **Controllers**: `app/controllers/{domain}/{name}_controller.ts`
- **Services**: `app/services/{domain}/{name}_service.ts`
- **Models**: `app/models/{name}.ts`
- **Validators**: `app/validators/{domain}/{resource}/{action}_validator.ts`
- **DTOs**: `app/core/dto/{domain}/{resource}/{action}_dto.ts`
- **Types/Enums**: `app/core/types/{domain}/{name}.ts`

### Frontend
- **Routes**: `src/app/app.routes.ts`
- **Environment**: `src/environments/environment.{development,ts}`
- **Services**: `src/app/infra/services/{name}/{name}.service.ts`
- **Gateways**: `src/app/infra/gateways/{name}/{name}-gateway.service.ts`
- **Guards**: `src/app/infra/guards/{name}.guard.ts`
- **Public Pages**: `src/app/pages/public/{name}/`
- **Private Pages**: `src/app/pages/private/{name}/`
- **Feature Modules**: `src/app/pages/private/modules/{feature}/`

---

## Accessibility Requirements (Frontend)

- MUST pass all AXE checks
- MUST follow WCAG AA minimums
- Focus management for keyboard navigation
- Color contrast ratios
- Appropriate ARIA attributes
- Use `NgOptimizedImage` for all static images (not for base64 inline images)
