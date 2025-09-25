# Kdongs

A set of web tools, that over the years I could not find software (paid) that would cover all my needs.

### Roadmap

- [x] Wallet management, specifically for investments, covering basic depoits, withdraws, investment registry, profit tracking and currency exchange.
- [ ] Market ticker data, investment calculators, and price tracking and warnings.

### READMEs

- API [README](packages/backend/README.md)
- Angular [README](packages/frontend/README.md)

</br>
</br>

# Installation

### Setup and Preparation

1. Clone the repository.

```bash
git clone https://github.com/lfsc09/kdongs-mono.git
cd kdongs-mono
```

2. Install dependencies

```bash
npm install
```

#### Backend

3. Run the `setup-backend.sh`

```bash
npm run dev:setup
```

> This will:
> 
> - Create the project `.env` and `.env.test` file if they don't exist.
> - Generate an `APP_KEY` in both files.
> - Create a random `root` DB user password, for the Docker Postgres container to use and fill it in `.env` and `.env.test`.
> - Fill the created password in `.env` and `.env.test` at `DB_PASSWORD`.

#### Frontend

</br>

### Run

1. Bring up the Docker ecosystem

```bash
docker compose -f packages/backend/docker/compose.yaml --profile local up --build --detach
```

2. Load **backend** migrations & seeds 

> The ecosystem will have two isolated databases, one for the `.env` and another for the `.env.test`. So the tests will have a dedicated database, because each test completely erases all the data, before it runs.
> Test migrations don't need seeding.

```bash
# migrate .env
npm run dev:backend:migrate

# migrate .env.test
npm run test:backend:migrate
```

</br>

### Staging the Build ecosystem

After setting up the project, run the compose files to **build** the projects.

```bash
docker compose -f packages/backend/docker/compose.yaml --profile build up --build --detach
```

</br>
</br>

# Usage

### As acting developer

Independently run in development the frontend or backend with:

```bash
npm run dev:frontend
npm run dev:backend
```

Or both with:

```bash
npm run dev:mono
```

To execute tests while developing.

#### Backend

```bash
# Don't forget to migrate first
npm run test:backend:migrate
npm run test:backend
```

#### Frontend

```bash
npm run test:frontend
```

</br>
</br>

# Uninstall

### The Local ecosystem

To bring down the ecosystem without losing the current data:

```bash
docker compose -f packates/backend/docker/compose.yaml --profile local down
```

If you want complete deletion, **including its data**:

```bash
docker compose -f packates/backend/docker/compose.yaml --profile local down --volumes --rmi all
```

</br>

### The Build ecosystem

```bash
docker compose -f packates/backenddocker/compose.yaml --profile build down
```
