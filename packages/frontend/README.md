# Frontend - Angular SPA

## Overview

The frontend is an Angular 21.x single-page application (SPA) providing a modern, responsive interface.

The application uses signals for state management, standalone components, and follows Angular best practices for performance and accessibility.

---

## Main Packages

### Update all packages

Will update `package.json` with newer versions. **May break, if there are major version changes**

```bash
npm run dev:frontend:dependencies
```

```bash
npm run dev:frontend:dependencies:update
```

To install latests packages run.

```bash
npm install
```

### [Angular](https://angular.dev/overview)

#### Update

Check [Angular update schedule](https://angular.dev/reference/releases).

Also check the [update guide](https://angular.dev/update-guide), for upgrading between major versions.

**Before updating, check if the corresponding version of PrimeNG has been released.**

```bash
npx --workspace frontend ng update @angular/core@<version> @angular/cli@<version>
```

</br>

### [FontAwesome](https://fontawesome.com/search?ic=free&o=r)

</br>

### Luxon

[npm](https://www.npmjs.com/package/luxon)

```bash
npm install --workspace luxon @kdongs-mono/frontend
```

</br>

### Big

[npm](https://www.npmjs.com/package/big.js)

```bash
npm install big.js --workspace @kdongs-mono/frontend
npm install --save-dev @types/big.js --workspace @kdongs-mono/frontend
```
