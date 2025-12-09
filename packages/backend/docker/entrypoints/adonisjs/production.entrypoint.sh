#!/bin/sh
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "[INFO] $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "Starting AdonisJS container..."

# Load DB password from Docker secret
if [ -f /run/secrets/root_pass ]; then
    export DB_PASSWORD=$(cat /run/secrets/root_pass)
    log_success "Database password loaded from secret"
else
    log_warn "No DB password secret found"
fi

# Load APP_KEY from Docker secret (generated during bootstrap)
if [ -f /run/secrets/app_key ]; then
    export APP_KEY=$(cat /run/secrets/app_key)
    log_success "APP_KEY loaded from secret"
else
    log_error "APP_KEY secret not found!"
    log_error "   Run: openssl rand -base64 32 > docker/secrets/app_key"
    exit 1
fi

# Wait for database to be ready
log_info "Waiting for database..."
timeout 30 sh -c 'until nc -z $DB_HOST $DB_PORT; do sleep 1; done' || {
    log_error "Database connection timeout"
    exit 1
}
log_success "Database is ready"

# Run migrations (only run, don't fresh!)
log_info "Running database migrations..."
node ace migration:run --force

log_success "Container ready!"
exec "$@"
