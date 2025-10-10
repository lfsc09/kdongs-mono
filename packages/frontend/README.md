## Main Packages

### [Angular](https://angular.dev/overview)

#### Update

Check [Angular update schedule](https://angular.dev/reference/releases).

Also check the [update guide](https://angular.dev/update-guide), for upgrading between major versions.

**Before updating, check if the corresponding version of PrimeNG has been released.**

```bash
npx --workspace frontend ng update @angular/core@<version> @angular/cli@<version>
```

</br>

### [Tailwindcss](https://tailwindcss.com/docs/installation/using-vite)

#### Update

```bash
npm install --workspace frontend tailwindcss@latest @tailwindcss/postcss@latest postcss@latest
```

</br>

### [ZardUi](https://zardui.com/docs/installation)

#### Update

Delete:

1. `src/app/pages/shared/components` and `src/app/pages/shared/utils`
2. Most of code in `src/styles.css`
3. `components.json`

Re-run the installation process, and:

1. Choose to install components and utils at `src/app/pages/shared/`
2. Check if `components.json` will point to correct location above
3. Check if `tsconfig.json` will have `@shared` path to correct location above

```bash
npx --workspace frontend @ngzard/ui init
```

After setup install the used components:

> This script will install all used components in the project

```bash
npm run zardui:reinstall-components --workspace frontend
```

</br>

### [FontAwesome](https://fontawesome.com/search?ic=free&o=r)

</br>

### [Zod](https://zod.dev/basics)

```bash
npm install --workspace frontend zod
```

