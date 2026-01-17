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

# Ecosystem (Deployment)

## Services

| Service | Description |
| -- | -- |
| nginx | Web server and reverse proxy (serves static Angular frontend files, proxies `/api/*` to backend, etc) |
| certbot | SSL certificate management with ACME challenge via webroot |
| api-backend | Adonisjs RESTful API endpoints |
| api-postgres | PostgreSQL 16 Alpine database (with pg_stat_statements extension) |
| frontend-builder | Builds Angular application |

</br>

## First Time Installation

#### 1. Run the bootstrap script `production.bootstrap.sh`

> **What it does**:
>
> At **root** phase:
>   1. Create deploy user `<vps-user>` with sudo access
>   2. Generate SSH key for GitHub Actions deployment
>   3. Update and install necessary packages (Docker, Docker Compose, Git, UFW, Fail2Ban, etc.)
>   4. Configure firewall (UFW) and Fail2Ban
>   5. Enable automatic security updates
>   6. Setup log rotation for backup logs
>   7. Switch to deploy user for application setup
>
> At **user** phase:
>   1. Clone or update the application repository
>   2. Configure git for read-only access
>   3. Generate Docker secrets (DB password, APP_KEY)
>   4. Update `<domain>` in nginx configuration
>   5. Set proper permissions for secrets
>   6. Create backup directory
>   7. Setup automated database backups via crontab

**Usage**: `sudo ./production.bootstrap.sh <vps-user> <domain> <email>`

> More info in [`production.bootstrap.sh`](./scripts/production.bootstrap.sh)

```bash
# Example
# bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/production.bootstrap.sh) \
#   <vps-user> \
#   your-domain.com \
#   your-email@example.com
```

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/production.bootstrap.sh)
```

**Notes**:

> Must be run as root initially (will switch to created user automatically)

> The script is idempotent - safe to run multiple times

> Configure containers env variables in `docker/compose.production.yaml`.

> There are resource limitations for containers configured in `docker/compose.production.yaml`.

#### 2. Obtain SSL certificate:

```bash
cd ~/kdongs-mono/docker
```

```bash
docker compose up -d nginx
```

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d <your-domain.com> -d <www.your-domain.com> \
  --email <your-email@example.com> \
  --agree-tos
```

#### 3. Start all services:

```bash
docker compose up -d
```

</br>

## Certificates

The certbot container runs a renewal loop every 12 hours.

</br>

## Backups

### Manual generation with `export-database.sh`

> **What it does**:
> 1. Exports the specified PostgreSQL database from the Docker container.
> 2. Compresses the output using gzip.

**Usage**: `[CONTAINER_NAME=<container-name>] [DB_NAME=<db-name>] [DB_USER=<db-user>] ./export-database.sh [backup-name-prefix] [backup-dir]`

> More info in [`export-database.sh`](./docker/postgres/scripts/export-database.sh)

```bash
# Export to default backup name prefix and backup dir
~/kdongs-mono/docker/postgres/scripts/export-database.sh

# Export to custom backup name prefix and backup dir
~/kdongs-mono/docker/postgres/scripts/export-database.sh backup /custom/path

# Custom container, DB, user, backup name prefix, and backup dir
CONTAINER_NAME=my-postgres-container DB_NAME=mydb DB_USER=dbuser ~/kdongs-mono/docker/postgres/scripts/export-database.sh backup /custom/path
```

### Automatic generation with `auto-backup.sh` and `cron`

> **What it does**:
> 1. Creates a database backup using export-database.sh.
> 2. Cleans up backups older than the specified retention period.

**Usage**: `[BACKUP_DIR=<backup-dir>] [DB_NAME=<db-name>] [DB_USER=<db-user>] ./auto-backup.sh [retention-days]`

> More info in [`auto-backup.sh`](./docker/postgres/scripts/auto-backup.sh)

```bash
# Backup with 7 days retention
~/kdongs-mono/docker/postgres/scripts/auto-backup.sh

# Backup with 14 days retention
~/kdongs-mono/docker/postgres/scripts/auto-backup.sh 14

# Custom backup directory with 7 days retention
BACKUP_DIR=/custom/path ~/kdongs-mono/docker/postgres/scripts/auto-backup.sh

# Custom DB and user with 7 days retention
DB_NAME=mydb DB_USER=dbuser ~/kdongs-mono/docker/postgres/scripts/auto-backup.sh
```

**Cron Config**: `0 2 * * * [DB_NAME=<db-name>] [DB_USER=<db-user>] /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh <retention-days> >> /var/log/kdongs-backup.log 2>&1`

```bash
# Default values
0 2 * * * /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh >> /var/log/kdongs-backup.log 2>&1

# 14 days retention
0 2 * * * /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh 14 >> /var/log/kdongs-backup.log 2>&1

# Custom backup directory
0 2 * * * BACKUP_DIR=/custom/path /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh >> /var/log/kdongs-backup.log 2>&1

# Custom DB and user
0 2 * * * DB_NAME=mydb DB_USER=dbuser /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh >> /var/log/kdongs-backup.log 2>&1
```

> Automated backups are configured via cron. (setup in `production.bootstrap.sh`)

> Logs created will be rotated as configured by `production.bootstrap.sh`.

### Sync to remote storage

Sync backups to remote storage.

```bash
# Configure remote (S3, Google Drive, etc.)
rclone config

# Add to cron after auto-backup (runs at 3 AM daily)
0 3 * * * rclone sync /home/<vps-user>/backups/ remote:kdongs-backups/
```

### Restore backup with `import-database.sh`

> **What it does**:
> 1. Imports the specified PostgreSQL database into the Docker container. (`.sql.gz` or `.sql`)

**Usage**: `[DB_NAME=<db-name>] [DB_USER=<db-user>] ./import-database.sh <backup-file>`

> More info in [`import-database.sh`](./docker/postgres/scripts/import-database.sh)

```bash
# Import from compressed backup file
~/kdongs-mono/docker/postgres/scripts/import-database.sh ./backups/backup-20241209-120000.sql.gz

# Import from uncompressed backup file
~/kdongs-mono/docker/postgres/scripts/import-database.sh ./backups/backup-20241209-120000.sql

# Custom DB and user
DB_NAME=mydb DB_USER=dbuser ~/kdongs-mono/docker/postgres/scripts/import-database.sh ./backups/backup-20241209-120000.sql.gz
```

</br>

## Deployment

### Manual deployment with `production.deploy.sh`

> **What it does**:
> 1. Prompts for confirmation before proceeding.
> 2. Checks out the specified tag or latest from main branch.
> 3. Creates a database backup. *(with "pre-deploy" prefix)*
> 4. Builds and deploys the Docker containers.

**Usage**: `[BACKUP_DIR=<backup-dir>] [DB_NAME=<db-name>] [DB_USER=<db-user>] ./production.deploy.sh [<tag>|latest]`

> More info in [`production.deploy.sh`](./scripts/production.deploy.sh)

```bash
# Deploy latest from main branch (default)
~/kdongs-mono/scripts/production.deploy.sh

# Deploy latest from main branch (explicit)
~/kdongs-mono/scripts/production.deploy.sh latest

# Deploy specific tag
~/kdongs-mono/scripts/production.deploy.sh v1.2.3

# Custom backup directory
BACKUP_DIR=/custom/path ~/kdongs-mono/scripts/production.deploy.sh

# Custom DB and backup dir
BACKUP_DIR=/custom/path DB_NAME=mydb DB_USER=dbuser ~/kdongs-mono/scripts/production.deploy.sh
```

### Automated deployment

Deployments are triggered automatically on GitHub releases via workflows [`deploy.yaml`](./.github/workflows/deploy.yml).

Add the required Github secrets.

| **Secret Name** | **Description** |
|-----------------|-----------------|
| `VPS_SSH_KEY` | Private SSH key for authentication to VPS (e.g. `~/.ssh/id_ed25519`) |
| `VPS_HOST` | VPS server hostname or IP address |
| `VPS_USER` | SSH username for VPS login |
| `VPS_REPO_PATH` | Full path to repository inside VPS |
| `VPS_BACKUP_DB_NAME` | PostgreSQL database name for backups |
| `VPS_BACKUP_DB_USER` | PostgreSQL database user for backups |
| `VPS_BACKUP_PATH` | Directory path for storing backups (defaults to `/home/<VPS_USER>/backups`)|
| `VPS_HEALTHCHECK_ENDPOINT` | URL endpoint for health check after deployment |

</br>

## Troubleshooting

| **Commands** | **Description** |
| -- | -- |
| **Container Commands** | |
| `docker compose restart <container-name>` | Restart a container |
| `docker exec kdongs-api-postgres pg_isready -U adonisjs` | Check DB is healthy |
| `docker exec -it kdongs-api-postgres psql -U adonisjs -d app` | Access DB container |
| `docker compose up -d --build frontend-builder` | Rebuild frontend |
| **Certificate Commands** | |
| `docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/<your-domain>/cert.pem -noout -dates` | Check certificate |
| `docker compose exec certbot certbot renew --dry-run` | Manual test certificate generation |
| `docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d <your-domain> --force-renewal` | Certificate manual renewal |
| **Backup Commands** | |
| `docker run --rm -v kdongs_api-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data-backup.tar.gz /data` | Backup database volume |
| `docker run --rm -v kdongs_api-postgres-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgres-data-backup.tar.gz --strip 1"` | Restore database volume |
| `find ~/backups -name "*.sql.gz" -mtime +30 -delete` | Manually remove old backups |

</br>

## Monitoring

### Database

```bash
# Connect to database
docker exec -it kdongs-api-postgres psql -U adonisjs -d app

# Check database size
SELECT pg_size_pretty(pg_database_size('app'));

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

# Exit psql
\q
```

</br>
</br>

# Ecosystem (Development)

## Installation

#### 1. Clone the repository.

```bash
git clone https://github.com/lfsc09/kdongs-mono.git
cd kdongs-mono
```

#### 2. Install dependencies.

```bash
npm install
```

#### 3. Setup project.

```bash
npm run dev:setup
```

> **This will**:
> 
> 1. Create the project `.env` and `.env.test` file if they don't exist.
> 2. Generate an `APP_KEY` in both files.
> 3. Create a random `root` DB user password, for the Docker Postgres container to use and fill it in `.env` and `.env.test`.
> 4. Fill the created password in `.env` and `.env.test` at `DB_PASSWORD`.

#### 4. Bring up the backend ecosystem.

##### only db

```bash
npm run dev:docker-db-up
```

##### node + db

```bash
npm run dev:docker-full-up
```

> Configure containers env variables in `docker/compose.local.yaml`.

> *Will automatically run migrations with adonisjs Entrypoint.

#### 5. Run **backend** migrations & seeds. (**dev:docker-db-up only**)

> The ecosystem will have two isolated databases, one for the `.env` and another for the `.env.test`. So the tests will have a dedicated database, because each test completely erases all the data, before it runs.

##### regular migrations

```bash
# migrate with .env
npm run dev:backend:migrate
```

##### migrations for testing purposes

> Test migrations don't need seeding.

```bash
# migrate with .env.test
npm run test:backend:migrate
```

</br>

## Run

##### backend

```bash
npm run dev:backend
```

##### frontend

```bash
npm run dev:frontend
```

##### both

```bash
npm run dev:mono
```

</br>

## Run tests

##### backend tests

> Migrate the test-db first

```bash
npm run test:backend:migrate
```

```bash
npm run test:backend
```

##### frontend tests

```bash
npm run test:frontend
```

</br>

## Uninstall

> *Will delete all the data.*

##### db-only profile

```bash
npm run dev:backend:docker-db-down
```

##### full profile

```bash
npm run dev:backend:docker-full-down
```
