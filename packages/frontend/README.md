# Frontend - Angular SPA

## Overview

The frontend is an Angular 21.x single-page application (SPA) providing a modern, responsive interface.

The application uses signals for state management, standalone components, and follows Angular best practices for performance and accessibility.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.9.x | Type-safe language |
| **Angular** | 21.1.x | UI framework |
| **Tailwind CSS** | 4.1.x | Utility-first styling |
| **Zod** | 4.3.x | Runtime schema validation |
| **Font Awesome** | 7.1.x | Icon library |
| **Prettier** | Latest | Code formatting |

---

## Directory Structure

```
packages/frontend/src/app/
├── app.routes.ts             # 
├── infra/                    # Infrastructure layer
│   ├── services/             # Core services
│   │   ├── identity/         # User authentication state
│   │   ├── theme/            # Dark/light theme management
│   │   ├── message/          # Toast notifications
│   │   └── viewport/         # Responsive layout
│   ├── gateways/             # API integration layer
│   │   ├── login/            # Authentication Endpoints
│   │   ├── investments/      # Investments Endpoints
│   │   ├── .../
│   │   └── shared/           # Base gateway class
│   └── guards/               # Route guards
│       ├── gatekeeper.guard.ts    # Authentication guard
│       └── authorization.guard.ts # Permission guard
├── pages/
│   ├── public/
│   │   └── landing/          # Login page
│   ├── private/
│   │   ├── landing.ts        # Authenticated app shell
│   │   ├── components/       # Shared components (topbar, sidebar)
│   │   └── modules/          # Feature modules
│   │       └── investments/  # Investment management feature
│   └── components/           # Global components
└── environments/             # Environment configuration
```

---

## Architecture Layers

- [Arquitecture Layers](/packages/frontend/docs/architecture.md)

---

## Main Packages

### Update all packages

Will update `package.json` with newer versions. **May break, if there are major version changes**

```bash
npx npm-check-updates -u --workspace frontend
npm install --workspace frontend
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

### [Tailwindcss](https://tailwindcss.com/docs/installation/using-vite) (https://angular.dev/guide/tailwind)

```bash
cd packages/frontend
ng add tailwindcss
```

</br>

### [FontAwesome](https://fontawesome.com/search?ic=free&o=r)

</br>

### [Zod](https://zod.dev/basics)

```bash
npm install --workspace frontend zod
```
