# Backend - AdonisJS API

## Overview

The backend is an AdonisJS 7.x application providing a RESTful API.

### Notes

- Automatic `Schemas` from DB in `/database/schema.ts` are disabled since it introduces a lot more boilerplate code and difficulties, when trying to type columns with `Big`. Extending `BaseModel` is still the cleanest and fastest way to go in Models.
- Despite the newest 7.x version outputs types to be used in other packages, all the types and requests dtos are in `@kdongs-mono/domain`.

### Core Features
- **User Authentication**: Token-based authentication with HTTP-only cookies
- **Wallet Management**: Create and manage multiple investment wallets
- **Investment Tracking**: Support for Brazilian assets (SEFBFR stocks, public/private bonds)
- **Performance Analytics**: Real-time portfolio performance calculation
- **Multi-Currency Support**: Handle investments in different currencies
- **Transaction History**: Track wallet movements (deposits, withdrawals)

---

## Main Packages

### Check & Update all packages

Will update `package.json` with newer versions. **May break, if there are major version changes**

```bash
npm run dev:backend:dependencies
```

```bash
npm run dev:backend:dependencies:update
```

To install latests packages run.

```bash
npm install
```

### Bigjs

[npm](https://www.npmjs.com/package/big.js)

```bash
npm install big.js --workspace @kdongs-mono/backend
npm install --save-dev @types/big.js --workspace @kdongs-mono/backend
```

### uuid

[npm](https://www.npmjs.com/package/uuid)

```bash
npm install uuid --workspace @kdongs-mono/backend
```

### randexp

[npm](https://www.npmjs.com/package/randexp)

```bash
npm install randexp --workspace @kdongs-mono/backend
```
