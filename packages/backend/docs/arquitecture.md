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

## Database Schema

According to migrations files `/packages/backend/database/migrations`.

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

## Testing Strategy

### Structure

- `tests/unit/` - Unit tests (services, utilities)
- `tests/functional/` - API integration tests (controllers, routes)

### Test Database

- Separate database for testing (`.env.test`)
- Fresh migrations before each test run
- No seeding (tests create their own data)

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
