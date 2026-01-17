#!/usr/bin/env bash
# Database Export Script
# Exports PostgreSQL database to a backup file
# Usage: ./export-database.sh [DB_NAME] [DB_USER] [BACKUP_DIR] [BACKUP_NAME]

set -euo pipefail

# --- CONFIG ---
CONTAINER_NAME="kdongs-api-postgres"
DB_NAME="${1:-}"
DB_USER="${2:-}"
BACKUP_DIR="${3:-$HOME/backups}"
BACKUP_NAME="${4:-backup-$(date +%Y%m%d-%H%M%S)}"
# ----------------

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

echo "========================================="
echo "PostgreSQL Database Export"
echo "========================================="
echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Backup Directory: $BACKUP_DIR"
echo "Backup Name: $BACKUP_NAME"
echo "========================================="

# Check if DB_NAME and DB_USER are provided
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  log_error "Database name and user must be specified."
  echo ""
  echo "Usage: $0 <db-name> <db-user> [backup-dir] [backup-name]"
  exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  log_error "Container '$CONTAINER_NAME' is not running."
  log_info "Start the container first with: docker compose up -d"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.sql.gz"

log_info "Creating backup..."
log_info "Output: $BACKUP_FILE"

# Export database using pg_dump with compression
docker exec -t "$CONTAINER_NAME" pg_dump \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  log_success "Backup created successfully!"
  echo "  File: $BACKUP_FILE"
  echo "  Size: $BACKUP_SIZE"
  echo ""
  log_info "To restore this backup, use:"
  echo "  ./import-database.sh $BACKUP_FILE"
else
  log_error "Backup failed!"
  exit 1
fi
