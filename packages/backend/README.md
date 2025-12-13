# Backend - AdonisJS API

## Overview

The backend is an AdonisJS 6.x application providing a RESTful API for personal finance management, specifically focused on investment portfolio tracking. The application handles user authentication, wallet management, investment tracking, and performance analytics.

### Core Features
- **User Authentication**: Token-based authentication with HTTP-only cookies
- **Wallet Management**: Create and manage multiple investment wallets
- **Investment Tracking**: Support for Brazilian assets (SEFBFR stocks, public/private bonds)
- **Performance Analytics**: Real-time portfolio performance calculation
- **Multi-Currency Support**: Handle investments in different currencies
- **Transaction History**: Track wallet movements (deposits, withdrawals)

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **AdonisJS** | 6.18.0 | Web framework & dependency injection |
| **Node.js** | Latest LTS | Runtime environment |
| **TypeScript** | 5.6.x | Type-safe language |
| **PostgreSQL** | 8.x | Relational database |
| **Lucid ORM** | Latest | Database ORM with migrations |
| **Vine** | Latest | Schema validation |
| **Bouncer** | Latest | Authorization & abilities |
| **Scrypt** | Latest | Password hashing |
| **Pino** | Latest | Structured logging |
| **Japa** | Latest | Testing framework |
| **Biome** | 2.2.2 | Linting & formatting |

---

## Directory Structure

```
packages/backend/
├── app/
│   ├── controllers/        # HTTP request handlers
│   ├── services/          # Business logic layer
│   ├── models/            # Lucid ORM models (database entities)
│   ├── validators/        # Vine validation schemas
│   ├── middleware/        # Request processing pipeline
│   ├── abilities/         # Bouncer authorization rules
│   ├── policies/          # Authorization policies
│   ├── exceptions/        # Error handling
│   └── core/
│       ├── types/         # Enums, constants, shared types
│       └── dto/           # Data Transfer Objects
├── config/                # Application configuration
├── database/
│   ├── migrations/        # Database schema versions
│   ├── seeders/          # Test data generation
│   └── factories/        # Model factories
├── start/
│   ├── routes.ts         # Route definitions
│   ├── kernel.ts         # Middleware stack
│   └── env.ts            # Environment validation
├── tests/
│   ├── unit/             # Unit tests
│   └── functional/       # API integration tests
└── bin/
    └── server.js         # Application entry point
```

---

## Architectural Layers

### 1. Controllers (`app/controllers/`)

**Responsibility**: Handle HTTP requests, validate input, delegate to services, return responses

**Pattern**: Thin controllers with dependency injection

```typescript
@inject()
export default class WalletsController {
  constructor(private walletsService: WalletsService) {}

  async index({ request, response, auth, bouncer }: HttpContext) {
    // 1. Authorization check
    if (await bouncer.denies(anyUser)) return response.forbidden()

    // 2. Input validation
    const input = await request.validateUsing(IndexValidator)

    // 3. Business logic delegation
    const result = await this.walletsService.walletsList(input)

    // 4. Response formatting
    return response.ok(result)
  }
}
```

**Key Controllers**:
- `AuthController` - Login/logout endpoints
- `WalletsController` - Full REST resource for wallet CRUD
- `WalletsPerformanceController` - Portfolio analytics

### 2. Services (`app/services/`)

**Responsibility**: Business logic, database operations, data transformation

**Pattern**: Single responsibility, dependency-free (or inject other services)

```typescript
export default class WalletsService {
  async walletsList(input: IndexRequest): Promise<IndexResponse> {
    // Database queries with Lucid ORM
    // Data transformations
    // Business rule enforcement
    return { data, metadata }
  }
}
```

**Key Services**:
- `AuthService` - Authentication logic, token management
- `WalletsService` - Wallet CRUD operations
- `PromiseBatch` - Utility for batching async operations
- `CurrencyConverter` - Exchange rate calculations
- Asset performance calculators (SEFBFR, bonds)

### 3. Models (`app/models/`)

**Responsibility**: Database entity representation, relationships, query scopes

**Pattern**: Lucid ORM with UUID primary keys, soft deletes, timestamps

```typescript
export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => WalletMovement)
  declare movements: HasMany<typeof WalletMovement>

  @beforeCreate()
  static assignUuid(wallet: Wallet) {
    wallet.id = uuidv7()
  }
}
```

**Key Models**:
- `User` - User authentication and profile
- `Wallet` - Investment wallet container
- `WalletMovement` - Deposits/withdrawals
- `AssetSefbfr` - Brazilian stock holdings
- `AssetBrlPublicBond` / `AssetBrlPrivateBond` - Bond investments

### 4. Validators (`app/validators/`)

**Responsibility**: Input validation using Vine schema DSL

**Pattern**: Request/response validation with type inference

```typescript
export const IndexValidator = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    sortBy: vine.string().optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional()
  })
)

export type IndexRequest = Infer<typeof IndexValidator>
```

### 5. Middleware (`app/middleware/`)

**Responsibility**: Cross-cutting concerns in the request pipeline

**Middleware Stack** (see `start/kernel.ts`):
1. `ForceJsonResponseMiddleware` - Ensure JSON responses
2. `CookieToAuthHeaderMiddleware` - Convert cookie to Authorization header
3. `AuthMiddleware` - Verify bearer token
4. `InitializeBouncerMiddleware` - Setup authorization context
5. `TimeLoggerMiddleware` - Request timing logs

### 6. Core Types & DTOs (`app/core/`)

**Responsibility**: Shared interfaces, enums, data contracts

**Structure**:
- `types/user/user_roles.ts` - User roles and permissions
- `types/investment/currencies.ts` - Supported currency codes
- `dto/auth/login_dto.ts` - Login request/response types
- `dto/investment/wallet/` - Wallet operation DTOs

---

## Key Design Patterns

### 1. Dependency Injection
```typescript
// Service injection into controllers
@inject()
export default class WalletsController {
  constructor(private walletsService: WalletsService) {}
}
```

### 2. Repository Pattern (via Lucid ORM)
```typescript
// Models act as repositories
const wallets = await Wallet.query()
  .where('userId', user.id)
  .preload('movements')
  .paginate(page, limit)
```

### 3. Soft Deletes
```typescript
// Models include deletedAt timestamp
async softDelete() {
  this.deletedAt = DateTime.now()
  await this.save()
}
```

### 4. UUID Primary Keys
```typescript
// All models use UUID v7 for IDs
@beforeCreate()
static assignUuid(model: Model) {
  model.id = uuidv7()
}
```

### 5. DTO Pattern
```typescript
// Clear contracts between layers
export type LoginRequest = { email: string; password: string }
export type LoginResponse = {
  data: {
    userEmail: string;
    userName: string;
    tokenExp: number;
    allowedIn: string[]
  }
}
```

---

## Authentication & Authorization

### Authentication Flow

#### Login Process

1. **Credentials Verification**: Email + scrypt hashed password
2. **Token Creation**: 1-day expiration access token
3. **Permission Assignment**: Get frontend permissions by user role
4. **Secure Cookie**: Return token in HTTP-only cookie

**Token Creation** (`app/services/auth/auth_service.ts`):
```typescript
async login(input: LoginRequest): Promise<LoginResponse> {
  // 1. Verify credentials
  const user = await User.verifyCredentials(input.email, input.password)

  // 2. Create access token (1 day expiration)
  const token = await User.accessTokens.create(user, ['*'], {
    expiresIn: '1 day'
  })

  // 3. Get frontend permissions by role
  const permissions = frontendPermissionsbyUserRole[user.role]

  // 4. Return response with token in secure cookie
  return {
    data: {
      allowedIn: permissions,
      tokenExp: token.expiresAt.getTime(),
      userEmail: user.email,
      userName: user.name
    },
    secureCookie: {
      token: token.token
    }
  }
}
```

### Authorization (Bouncer)

#### User Roles
```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// Frontend permissions by role
frontendPermissionsbyUserRole = {
  admin: ['INVESTMENTS_ACCESS'],
  user: ['INVESTMENTS_ACCESS']
}
```

#### Abilities (`app/abilities/main.ts`)
```typescript
export const onlyAdmin = Bouncer.ability((user: User) =>
  user.role === 'admin'
)

export const onlyUser = Bouncer.ability((user: User) =>
  user.role === 'user'
)

export const anyUser = Bouncer.ability((user: User) =>
  user.role === 'user' || user.role === 'admin'
)
```

#### Controller Usage
```typescript
async index({ bouncer, response }: HttpContext) {
  if (await bouncer.denies(anyUser)) {
    return response.forbidden({ error: 'Access denied' })
  }
  // ... proceed with logic
}
```

### Security Features

1. **HTTP-only Cookies**: Token stored in HTTP-only cookie (not accessible to JavaScript)
2. **CORS Configuration**: Credentials allowed, origin validation
3. **Password Hashing**: Scrypt algorithm (stronger than bcrypt)
4. **Token Expiration**: 1-day expiration with countdown tracking
5. **CSRF Protection**: Cookie-based auth with same-origin policy
6. **Input Validation**: Vine validators on all endpoints

---

## Database Schema

### Entity Relationship Diagram
```
┌─────────────┐
│    User     │
├─────────────┤
│ id (UUID)   │ PK
│ name        │
│ email       │ UNIQUE
│ password    │ Scrypt hashed
│ role        │ user | admin
│ createdAt   │
│ updatedAt   │
│ deletedAt   │ Soft delete
└──────┬──────┘
       │ 1
       │
       │ *
┌──────▼──────────┐
│     Wallet      │
├─────────────────┤
│ id (UUID)       │ PK
│ userId (UUID)   │ FK → User.id
│ name            │
│ currencyCode    │ USD, BRL, EUR
│ createdAt       │
│ updatedAt       │
│ deletedAt       │ Soft delete
└──────┬──────────┘
       │ 1
       ├────────────────────────┬────────────────────┬───────────────────┐
       │ *                      │ *                  │ *                 │ *
┌──────▼────────────┐  ┌────────▼────────┐  ┌───────▼──────────┐  ┌────▼─────────────┐
│ WalletMovement    │  │  AssetSefbfr    │  │AssetBrlPublicBond│  │AssetBrlPrivateBond│
├───────────────────┤  ├─────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id (UUID)         │  │ id (UUID)       │  │ id (UUID)        │  │ id (UUID)        │
│ walletId (UUID)   │  │ walletId (UUID) │  │ walletId (UUID)  │  │ walletId (UUID)  │
│ type              │  │ assetName       │  │ assetName        │  │ assetName        │
│ resultAmount      │  │ holderInstitute │  │ issueRate        │  │ issueRate        │
│ dateUtc           │  │ doneState       │  │ maturityDate     │  │ maturityDate     │
│ createdAt         │  │ createdAt       │  │ createdAt        │  │ createdAt        │
│ updatedAt         │  │ updatedAt       │  │ updatedAt        │  │ updatedAt        │
└───────────────────┘  └────────┬────────┘  └──────────────────┘  └──────────────────┘
                                │ 1
                                ├────────────┬─────────────┬──────────────┬─────────────┐
                                │ *          │ *           │ *            │ *           │ *
                       ┌────────▼─────┐  ┌──▼──────┐  ┌──▼────────┐  ┌──▼────────┐  ┌──▼────────┐
                       │AssetSefbfrBuy│  │...Sell  │  │...Transfer│  │...Dividend│  │...Split   │
                       └──────────────┘  └─────────┘  └───────────┘  └───────────┘  └───────────┘
                                        (+ BonusShare, Inplit)
```

### Key Tables

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,  -- Scrypt hashed
  role VARCHAR CHECK(role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

#### Wallets
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  currency_code VARCHAR(3) NOT NULL,  -- USD, BRL, EUR, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

#### Wallet Movements
```sql
CREATE TABLE wallet_movements (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,  -- deposit, withdrawal
  result_amount DECIMAL(20, 8) NOT NULL,
  date_utc TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Migrations Strategy

- **Version Control**: Each migration is timestamped and tracked
- **Rollback Support**: Down migrations for reversibility
- **Environment Separation**: Separate databases for `.env` and `.env.test`
- **Seeding**: Test data generation via seeders
- **Factories**: Model factories for test data

**Migration Example**:
```typescript
export default class CreateWalletsTable extends BaseSchema {
  async up() {
    this.schema.createTable('wallets', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('users.id').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('currency_code', 3).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('wallets')
  }
}
```

---

## API Contracts

### Base URL
- **Development**: `http://localhost:3333`
- **Production**: TBD

### Authentication Endpoints

#### POST /login
**Description**: Authenticate user and create access token

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "tokenExp": 1704067200000,
    "allowedIn": ["INVESTMENTS_ACCESS"]
  }
}
```

**Headers**:
- `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict`

**Errors**:
- `400` - Invalid credentials
- `422` - Validation error

#### POST /logout
**Description**: Invalidate current access token

**Headers**:
- `Cookie: token=<jwt>` (or `Authorization: Bearer <token>`)

**Response** (204 No Content)

### Investment Endpoints

All endpoints require authentication (Cookie or Authorization header)

#### GET /investments/wallets
**Description**: List user's wallets with pagination

**Query Parameters**:
```typescript
{
  page?: number          // Default: 1
  limit?: number         // Default: 10
  sortBy?: string        // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc'  // Default: 'desc'
}
```

**Response** (200 OK):
```json
{
  "data": {
    "wallets": [
      {
        "id": "uuid-v7",
        "name": "My Portfolio",
        "currencyCode": "USD",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "metadata": {
    "page": 1,
    "perPage": 10,
    "total": 25,
    "totalPages": 3,
    "hasMorePages": true
  }
}
```

#### POST /investments/wallets
**Description**: Create new wallet (step 1: get available currencies)

**Response** (200 OK):
```json
{
  "data": {
    "availableCurrencies": ["USD", "BRL", "EUR", "GBP"]
  }
}
```

#### POST /investments/wallets (store)
**Description**: Create new wallet (step 2: store wallet)

**Request**:
```json
{
  "name": "My Portfolio",
  "currencyCode": "USD",
  "userId": "uuid-v7"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "wallet": {
      "id": "uuid-v7",
      "name": "My Portfolio",
      "currencyCode": "USD",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /investments/wallets/:id
**Description**: Get single wallet details

**Response** (200 OK):
```json
{
  "data": {
    "wallet": {
      "id": "uuid-v7",
      "name": "My Portfolio",
      "currencyCode": "USD",
      "movements": [...],
      "assets": [...]
    }
  }
}
```

#### PUT /investments/wallets/:id
**Description**: Update wallet

**Request**:
```json
{
  "name": "Updated Portfolio Name",
  "currencyCode": "EUR"
}
```

**Response** (200 OK)

#### DELETE /investments/wallets/:id
**Description**: Soft delete wallet

**Response** (204 No Content)

#### GET /investments/performance
**Description**: Calculate portfolio performance metrics

**Query Parameters**:
```typescript
{
  walletIds: string[]  // Array of wallet UUIDs
}
```

**Response** (200 OK):
```json
{
  "data": {
    "indicators": {
      "totalBalance": "125000.50",
      "totalProfit": "25000.50",
      "profitPercent": "25.00"
    },
    "series": [
      {
        "date": "2024-01-01",
        "balance": "100000.00"
      }
    ],
    "wallets": [
      {
        "id": "uuid-v7",
        "name": "My Portfolio",
        "currentBalance": "125000.50",
        "profit": "25000.50",
        "profitPercent": "25.00"
      }
    ]
  }
}
```

### Error Responses

**Standard Error Format**:
```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "rule": "required"
    }
  ]
}
```

**Status Codes**:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Development Workflow

### Environment Variables

**`.env`**:
```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=<generated>
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=root
DB_PASSWORD=<generated>
DB_DATABASE=kdongs
```

### Database Management

```bash
# Start PostgreSQL
npm run dev:backend:docker-db-up

# Stop PostgreSQL
npm run dev:backend:docker-db-down

# Run migrations (dev DB)
npm run dev:backend:migrate

# Rollback migrations
npm run dev:backend:migrate:rollback
```

### Development Server

```bash
# Start dev server with hot reload
npm run dev:backend
# Server runs on http://localhost:3333
```

### Code Quality

```bash
# Format code with Biome
npm run dev:backend:format

# Lint code
npm run dev:backend:lint
```

---

## Testing Strategy

### Structure

- `tests/unit/` - Unit tests (services, utilities)
- `tests/functional/` - API integration tests (controllers, routes)

### Test Database

- Separate database for testing (`.env.test`)
- Fresh migrations before each test run
- No seeding (tests create their own data)

### Running Tests

```bash
# Migrate test database
npm run test:backend:migrate

# Run all tests
npm run test:backend

# Run specific test file
npm run test:backend -- tests/functional/wallets.spec.ts
```

### Example Test

```typescript
test.group('Wallets API', (group) => {
  group.each.setup(async () => {
    // Setup: create test user, login, etc.
  })

  test('GET /investments/wallets returns user wallets', async ({ client }) => {
    const response = await client
      .get('/investments/wallets')
      .cookie('token', testToken)

    response.assertStatus(200)
    response.assertBodyContains({ data: { wallets: [] } })
  })
})
```

### Testing Best Practices

1. **Isolation**: Each test is independent
2. **AAA Pattern**: Arrange, Act, Assert
3. **Mocking**: Mock external dependencies (database, HTTP, etc.)
4. **Coverage**: Aim for >80% coverage on critical paths
5. **CI Integration**: Tests run on pre-commit and CI/CD

---

## Deployment Considerations

### Build
```bash
npm run build
# Compiles to build/ directory
```

### Environment
- Production `.env` with secure `APP_KEY`
- Update CORS allowed origins for production domain

### Database
- PostgreSQL (managed or self-hosted)
- Run migrations: `node ace migration:run --force`

### Process Manager
- PM2 or systemd for process management

---

## Main Packages

### Bigjs

[npm](https://www.npmjs.com/package/big.js?activeTab=readme)

```bash
npm install big.js --workspace backend
npm install --save-dev @types/big.js --workspace backend
```

### uuid

[npm](https://www.npmjs.com/package/uuid)

```bash
npm install uuid --workspace backend
```

### randexp

[npm](https://www.npmjs.com/package/randexp)

```bash
npm install randexp --workspace backend
```
