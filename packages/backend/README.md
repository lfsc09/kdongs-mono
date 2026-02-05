# Backend - AdonisJS API

## Overview

The backend is an AdonisJS 6.x application providing a RESTful API.

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
| **AdonisJS** | 6.x | Web framework & dependency injection |
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

## Architecture Layers

- [Arquitecture Layers](/packages/backend/docs/arquitecture.md)

---

## Main Packages

### Update all packages

Will update `package.json` with newer versions. **May break, if there are major version changes**

```bash
npx npm-check-updates -u --workspace backend
npm install --workspace backend
```

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
