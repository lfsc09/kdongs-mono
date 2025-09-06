# The API

## Installation

### As acting developer

1. Clone the repository.

```bash
git clone https://github.com/lfsc09/kdongs-api-adonisjs.git
cd kdongs-api-adonisjs
```

2. Create the project `.env` and `.env.test` file if they don't exist and generate an `APP_KEY` in both files.

```bash
cp .env.example .env

# generate app_key in .env
node ace generate:key

# generate app_key in .env.test
NODE_ENV=test node ace generate:key
```

3. Create a random `root` DB user password, for the Docker Postgres container to use.

```bash
openssl rand -base64 12 > ./docker/secrets/postgres_root_pass.txt
```

After creating the file with the password, manually fill this password in `.env` and `.env.test` files for the `DB_PASSWORD` environment variable.

4. Bring up the Docker ecosystem

```bash
docker compose -f docker/compose.yaml --profile local up --build --detach
```

5. Load the migrations & seeds

The ecosystem will have two isolated databases, one for the `.env` and another for the `.env.test`. So the tests will have a dedicated database, because each test completely erases all the data, before it runs.

So the test migrations don't need seeding.

```bash
# migrate .env
node ace migration:fresh --seed --force

# migrate .env.test
NODE_ENV=test node ace migration:fresh --force
```

</br>

### As tester of Build ecosystem

If only cloning the repo to build it and test it, you can follow theses steps.

```bash
cp .env.example .env
node ace generate:key
openssl rand -base64 12 > ./docker/secrets/postgres_root_pass.txt
##
# User manual action - check comment bellow
##
docker compose -f docker/compose.yaml --profile build-test up --build --detach
```

> After creating the `root` DB user password, manually fill this password in the `.env` file for the `DB_PASSWORD` environment variable.

</br>
</br>

## Usage

### As acting developer

Run this if you want to run the API while developing, it supports HMR (Hot module replacement).

```bash
npm run dev
```

To execute tests while developing.

> Don't forget to migrate first, check step 5. in installation above.

```bash
npm run test
```

</br>
</br>

## Uninstalling

### The Local ecosystem

To bring down the ecosystem without losing the current data:

```bash
docker compose -f docker/compose.yaml --profile local down
```

If you want complete deletion of the ecosystem, **including its data**:

```bash
docker compose -f docker/compose.yaml --profile local down --volumes --rmi all
```

</br>

### The Build ecosystem

```bash
docker compose -f docker/compose.yaml --profile build-test down
```

or

```bash
docker compose -f docker/compose.yaml --profile build-test down --volumes --rmi all
```

</br>
</br>

## Dependencies

### Bigjs

[npm](https://www.npmjs.com/package/big.js?activeTab=readme)

```bash
npm install big.js
npm install --save-dev @types/big.js
```

### uuid

[npm](https://www.npmjs.com/package/uuid)

```bash
npm install uuid
```

### randexp

[npm](https://www.npmjs.com/package/randexp)

```bash
npm install randexp
```

