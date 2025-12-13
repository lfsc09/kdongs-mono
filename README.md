# Kdongs

A set of web tools, that over the years I could not find software (paid) that would cover all my needs.

### Roadmap

#### Finished

- [x] Wallet management (create, delete);

#### In Progress

- [x] Make wallet movements (deposit, withdraw);
- [ ] Manage asset inclusion in wallets;
- [ ] Wallet profit calculation;
- [x] Deployment scripts

#### Backlog

- [ ] Allow change wallet currency (simulation only);
- [ ] Market data;
  - [ ] Stocks;
  - [ ] Currency rates;
  - [ ] Private and public bonds info (cdi, selic, etc);
- [ ] Investments alerts;
- [ ] Investment calculators;

### Additional READMEs

1. [Backend Adonisjs Api](packages/backend/README.md)
2. [Frontend Angular](packages/frontend/README.md)

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

???

</br>

### Run (*development*)

1. Bring up the backend ecosystem (**only db**).

```bash
npm run dev:backend:docker-db-up
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

### Run (*staging*)

1. Bring up the backend ecosystem (**db + node**)

```bash
npm run dev:backend:docker-full-up
```

2. Load **backend** migrations & seeds 

```bash
npm run dev:backend:migrate
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

### Local ecosystem

*Will delete all the data.*

```bash
# Only db
npm run dev:backend:docker-db-down

# Db + node
npm run dev:backend:docker-full-down
```
