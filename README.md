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

#### nginx
- **Purpose**: Web server and reverse proxy
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**:
  - Serves Angular frontend (SPA)
  - Proxies `/api/*` to backend
  - SSL/TLS termination with Let's Encrypt
  - HTTP to HTTPS redirect

#### certbot
- **Purpose**: SSL certificate management
- **Features**:
  - Automatic certificate renewal every 12 hours
  - ACME challenge via webroot

#### api-backend
- **Purpose**: AdonisJS API server
- **Build**: `packages/backend/docker/dockerfile.production`
- **Port**: 8000 (mapped to internal 3333)
- **Features**:
  - PostgreSQL connection
  - Access token authentication
  - RESTful API endpoints

#### api-postgres
- **Purpose**: PostgreSQL database
- **Port**: 8001 (mapped to internal 5432)
- **Features**:
  - PostgreSQL 16 Alpine
  - Persistent data volume
  - Health checks
  - pg_stat_statements extension

#### frontend-builder
- **Purpose**: Builds Angular application
- **Build**: `packages/frontend/docker/dockerfile.production`
- **Note**: This is a build-time service that exits after building

</br>

## First Time Installation

#### 1. Run the bootstrap script providing `<your-domain>`, `<your-email@example.com>` and `<your-user>` to the script:

```bash
# Example
# bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/production.bootstrap.sh) your-domain.com your-email@example.com your-user
```

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/production.bootstrap.sh)
```

> **What it does automatically**:
>
> **Root Phase** (requires sudo/root):
> 1. Creates `<your-user>` deployment user with sudo access
> 2. Updates system packages
> 3. Installs Docker and Docker Compose
> 4. Installs git, openssl, curl, and dependencies
> 5. Installs rclone for remote backups
> 6. Configures UFW firewall (SSH, HTTP, HTTPS)
> 7. Configures fail2ban for intrusion prevention
> 8. Enables automatic security updates
> 9. Creates target directory with proper ownership
> 10. Sets up SSH directory for deploy user
> 
> **User Phase** (runs as created user):
> 1. Clones repository from GitHub
> 2. Generates secure database password
> 3. Creates backend `.env` file with APP_KEY
> 4. Configures domain in nginx configuration
> 5. Sets proper file permissions
> 6. Sets up automated daily database backups (cron)
> 7. Creates backup directory
> 
> **Notes**:
> - Must be run as root initially (will switch to created user automatically)
> - If SSH keys for GitHub are not setup, cloning will fail - setup keys and re-run
> - The script is idempotent - safe to run multiple times
> - All configuration is logged with colored output

> *Configure containers env variables in `docker/compose.production.yaml`.

> *There are resource limitations for containers configured in `docker/compose.production.yaml`.

> *Domain is configured in `nginx/conf.d/site.conf` and automatically updated by bootstrap script.

#### 2. Obtain SSL certificate:

```bash
cd /var/www/kdongs-mono/docker
```

```bash
docker compose up -d nginx
```

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d your-domain.com -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos
```

#### 3. Start all services:

```bash
docker compose up -d
```

</br>

## Maintaining

#### Certificates

The certbot container runs a renewal loop every 12 hours.

#### Backups

Create manual backup:

```bash
./postgres/scripts/export-database.sh ../backups "backup-$(date +%Y%m%d)"
```

Automated backups are configured via cron (setup by bootstrap):
```bash
# Add this line (runs at 2 AM daily, keeps 7 days of backups)
0 2 * * * /var/www/kdongs-mono/docker/postgres/scripts/auto-backup.sh 7 >> /var/log/kdongs-backup.log 2>&1
```

Setup log rotation to prevent disk space issues:

```bash
sudo nano /etc/logrotate.d/kdongs

# Add this configuration:
/var/log/kdongs-*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
}
```

#### Backup to remote storage

Sync backups to remote storage:

```bash
# Configure remote (S3, Google Drive, etc.)
rclone config

# Add to cron after auto-backup
0 3 * * * rclone sync /var/www/kdongs-mono/backups/ remote:kdongs-backups/
```

#### Restore

```bash
./postgres/scripts/import-database.sh ../backups/backup-20241209-120000.sql.gz
```

#### Access database

```bash
docker exec -it kdongs-api-postgres psql -U adonisjs -d app
```

</br>

## Deployment

#### Manual deployment with `production.deploy.sh`

> **What it does**:
> 1. Optionally checks out specified git tag
> 2. Creates pre-deployment database backup
> 3. Asks for confirmation
> 4. Builds Docker containers
> 5. Stops old containers
> 6. Starts new containers
> 7. Displays status and logs
> 
> *It creates a backup before deployment and asks for confirmation.

```bash
cd /var/www/kdongs-mono

# Deploy latest main branch
./scripts/deploy.sh

# Deploy specific release tag
./scripts/deploy.sh v1.2.3
```

#### Automated deployment

Deployments are triggered automatically on GitHub releases via GitHub Actions.

Add the required Github secrets.

</br>

## Troubleshooting

| **Container Commands** | **Description** |
| -- | -- |
| `docker compose restart <container-name>` | Restart a container |
| `docker exec kdongs-api-postgres pg_isready -U adonisjs` | Check DB is healthy |
| `docker compose up -d --build frontend-builder` | Rebuild frontend |
| -- | -- |
| **Certificate Commands** | **Description** |
| `docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/<your-domain>/cert.pem -noout -dates` | Check certificate |
| `docker compose exec certbot certbot renew --dry-run` | Manual test certificate generation |
| `docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d <your-domain> --force-renewal` | Certificate manual renewal |
| -- | -- |
| **Backup Commands** | **Description** |
| `docker run --rm -v kdongs_api-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data-backup.tar.gz /data` | Backup database volume |
| `docker run --rm -v kdongs_api-postgres-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgres-data-backup.tar.gz --strip 1"` | Restore database volume |
| `find /var/www/kdongs-mono/backups -name "*.sql.gz" -mtime +30 -delete` | Manually remove old backups |

#### Database monitoring

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

#### 5. Run **backend** migrations & seeds.

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
