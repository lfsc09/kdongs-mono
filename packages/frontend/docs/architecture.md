## Architectural Layers

### 1. Components (`pages/`)

**Responsibility**: UI rendering, user interaction, local state

**Pattern**: Standalone components with signals

```typescript
@Component({
  selector: 'app-wallet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.scss']
})
export class WalletComponent {
  // Dependency injection via inject()
  private walletService = inject(WalletService)
  private gateway = inject(InvestmentsGatewayService)

  // Signal-based state
  wallets = signal<Wallet[]>([])
  isLoading = signal(false)

  // Computed derived state
  totalValue = computed(() =>
    this.wallets().reduce((sum, w) => sum + w.balance, 0)
  )

  constructor() {
    // Effect for reactive side effects
    effect(() => {
      this.loadWallets()
    })
  }
}
```

**Component Hierarchy**:
```
App (root)
├── MessageDocker (global toast container)
└── Router Outlet
    ├── Landing (public) - Login page
    └── Landing (private) - Authenticated shell
        ├── Topbar - Header navigation
        ├── SidebarModules - Feature navigation
        ├── LoadingBar - HTTP request indicator
        └── Router Outlet
            └── Investments (lazy-loaded)
                ├── Wallet - List view
                └── WalletPerformance - Analytics
```

### 2. Services (`infra/services/`)

**Responsibility**: Shared state, business logic, cross-cutting concerns

#### Infrastructure Services

**IdentityService** - User authentication state
```typescript
@Injectable({ providedIn: 'root' })
export class IdentityService {
  private _identity = signal<UserIdentity | null>(null)
  identity = this._identity.asReadonly()

  processIdentity(user: AuthenticatedUserDTO | null = null): boolean {
    // Validate token expiration
    // Store in localStorage keyed by host
    // Update signal state
  }

  clearAll(): void {
    // Clear signal and localStorage
  }
}
```

**ThemeManagerService** - Dark mode management
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeManagerService {
  isDarkTheme = signal<boolean>(false)

  // Effect in app component updates DOM
}
```

**MessageManagerService** - Global notifications
```typescript
@Injectable({ providedIn: 'root' })
export class MessageManagerService {
  private messages = signal<Message[]>([])

  showSuccess(text: string): void
  showError(text: string): void
  showInfo(text: string): void
}
```

#### Feature Services

**WalletService** - Wallet feature state
```typescript
@Injectable({ providedIn: 'root' })
export class WalletService {
  sidebarCollapsed = signal<boolean>(false)
  selectedWallets = signal<Map<string, Wallet>>(new Map())

  handleCollapse(): void
}
```

### 3. Gateways (`infra/gateways/`)

**Responsibility**: API communication, request/response handling, validation

**Pattern**: Gateway pattern with Zod validation

```typescript
@Injectable({ providedIn: 'root' })
export class InvestmentsGatewayService extends DefaultGatewayService {
  listUserWallets(request: ListWalletsRequest): Observable<ListWalletsResponse> {
    return this._httpClient
      .get<unknown>(`${this._apiUrl}/investments/wallets`, { params })
      .pipe(
        map(response => ListWalletsResponseSchema.parse(response)),
        catchError(this._handleError.bind(this))
      )
  }
}
```

**Zod Schema Validation**:
```typescript
// Runtime validation of API responses
const ListWalletsResponseSchema = z.object({
  data: z.object({
    wallets: z.array(WalletSchema)
  }),
  metadata: z.object({
    page: z.number(),
    perPage: z.number(),
    total: z.number()
  })
})

type ListWalletsResponse = z.infer<typeof ListWalletsResponseSchema>
```

**DefaultGatewayService** - Base class
```typescript
export abstract class DefaultGatewayService {
  protected _httpClient = inject(HttpClient)
  protected _apiUrl = environment.apiUrl

  protected _handleError(error: HttpErrorResponse): Observable<never> {
    // Parse error response
    // Throw GatewayError with structured data
  }
}
```

### 4. Guards (`infra/guards/`)

**Responsibility**: Route protection, authentication/authorization checks

**GatekeeperGuard** (Authentication):
```typescript
export const gatekeeperGuard: CanMatchFn = (route, segments) => {
  const identityService = inject(IdentityService)
  const router = inject(Router)

  const isAuthenticated = identityService.processIdentity()
  const isLoginRoute = segments[0]?.path === 'gate'

  if (!isAuthenticated && !isLoginRoute) {
    // Redirect to login
    return router.createUrlTree(['/gate'])
  }

  if (isAuthenticated && isLoginRoute) {
    // Redirect to app
    return router.createUrlTree(['/r!'])
  }

  return true
}
```

---

## Key Design Patterns

### 1. Standalone Components (Angular 21)
- No `NgModules`, all components use `standalone: true` (default in v21)
- Direct imports in component metadata
- Lazy-loaded routes with `loadComponent()`

### 2. Signal-Based State Management
```typescript
// Replace NgRx/RxJS state with signals
const count = signal(0)
const doubled = computed(() => count() * 2)

// Effects for side effects
effect(() => {
  console.log('Count is', count())
})

// Update state
count.set(1)
count.update(c => c + 1)
```

### 3. Gateway Pattern
- Abstraction layer between components and HTTP
- Centralized error handling
- Response validation with Zod
- Type-safe API contracts

### 4. Smart/Presentational Components
- **Smart components**: Handle data fetching, state management
- **Presentational components**: Pure UI rendering via inputs/outputs

### 5. Reactive Forms
```typescript
form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required])
})
```

---

## Authentication Flow

### Frontend Identity Management

The `IdentityService` manages user authentication state:

```typescript
processIdentity(user: AuthenticatedUserDTO | null = null): boolean {
  // 1. Check in-memory state
  if (user === null && this._identity() !== null) {
    if (!this._isValid(this._identity()?.tokenExp ?? 0)) {
      this.clearAll()
      return false
    }
    return true
  }

  // 2. Recover from localStorage or use provided user
  const identityRead = user === null
    ? this._recoverUserIdentity()
    : user

  // 3. Validate token expiration
  if (!this._isValid(identityRead?.tokenExp ?? 0)) {
    this.clearAll()
    return false
  }

  // 4. Update signal state
  this._identity.set(identityRead)

  // 5. Save to localStorage (keyed by host)
  if (user !== null) this._saveUserIdentity()

  return true
}
```

### Login Flow

1. User enters credentials in login form
2. `LoginGatewayService` sends POST request to `/login`
3. Backend returns user data with token in HTTP-only cookie
4. `IdentityService` processes and stores user identity in:
   - Signal state (reactive)
   - localStorage (persistence, keyed by host)
5. Router redirects to authenticated app (`/r!`)

### Route Protection

Routes are protected by `gatekeeperGuard`:

```typescript
export const routes: Routes = [
  {
    path: 'gate',
    canMatch: [gatekeeperGuard],
    loadComponent: () => import('./pages/public/landing/landing')
  },
  {
    path: 'r!',
    canMatch: [gatekeeperGuard],
    loadComponent: () => import('./pages/private/landing')
  }
]
```

### Security Features

1. **Token Validation**: Client-side expiration checking
2. **localStorage by Host**: Identity keyed by hostname for multi-environment support
3. **HTTP-only Cookies**: Token not accessible to JavaScript
4. **Automatic Redirect**: Expired tokens redirect to login
5. **Response Validation**: Zod schemas validate all API responses

## Environment Configuration

**Development** (`src/environments/environment.development.ts`):
```typescript
export const environment = {
  title: 'Kdongs',
  host: 'localhost',
  apiUrl: 'http://localhost:3333',
  tokenLifeSpan: 86400000,  // 1 day in ms
  tokenRefreshInterval: 60000  // 1 minute
}
```

**Production** (`src/environments/environment.ts`):
```typescript
export const environment = {
  title: 'Kdongs',
  host: 'production-host.com',
  apiUrl: 'https://api.production-host.com',
  tokenLifeSpan: 86400000,
  tokenRefreshInterval: 60000
}
```
