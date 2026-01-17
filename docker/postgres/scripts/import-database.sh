#!/usr/bin/env bash
# Database Import Script
# Imports PostgreSQL database from a backup file (compressed or uncompressed)
# Usage: [DB_NAME=<db-name>] [DB_USER=<db-user>] ./import-database.sh <backup-file>
#
# Examples:
#   ./import-database.sh ./backups/backup-20241209-120000.sql.gz                              # Import from compressed backup file
#   ./import-database.sh ./backups/backup-20241209-120000.sql                                 # Import from uncompressed backup file
#   DB_NAME=mydb DB_USER=dbuser ./import-database.sh ./backups/backup-20241209-120000.sql.gz  # Custom DB and user
#
# Parameters:
#   backup-file : Path to the backup file (required)
#
# Environment Variables:
#   DB_NAME    : Database name (optional, default: app)
#   DB_USER    : Database user (optional, default: adonisjs)
#
# This script does the following:
#   1. Imports the specified PostgreSQL database into the Docker container
#

set -euo pipefail

# --- CONFIG ---
BACKUP_FILE="${1:-}"
DB_NAME="${2:-}"
DB_USER="${3:-}"

CONTAINER_NAME="kdongs-api-postgres"
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
echo "PostgreSQL Database Import"
echo "========================================="

# Check if DB_NAME and DB_USER are provided
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  log_error "Database name and user must be specified."
  echo ""
  echo "Usage: $0 <backup-file> <db-name> <db-user>"
  exit 1
fi

# Check if backup file was provided
if [ -z "$BACKUP_FILE" ]; then
  log_error "No backup file specified."
  echo ""
  echo "Usage: $0 <backup-file> <db-name> <db-user>"
  echo ""
  echo "Example:"
  echo "  $0 ./backups/backup-20241209-120000.sql.gz mydatabase myuser"
  exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  log_error "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Backup File: $BACKUP_FILE"
echo "========================================="

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  log_error "Container '$CONTAINER_NAME' is not running."
  log_info "Start the container first with: docker compose up -d"
  exit 1
fi

# Confirm before proceeding
echo ""
log_warn "WARNING: This will REPLACE the current database with the backup!"
log_warn "  Current database '$DB_NAME' will be dropped and recreated."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  log_error "Import cancelled."
  exit 0
fi

echo ""
log_info "Importing backup..."

# Detect if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  log_info "Detected compressed backup (gzip)"
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql \
    --username="$DB_USER" \
    --dbname="postgres"
else
  log_info "Detected uncompressed backup"
  cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql \
    --username="$DB_USER" \
    --dbname="postgres"
fi

if [ $? -eq 0 ]; then
  log_success "Database imported successfully!"
  echo ""
  echo "Next steps:"
  echo "[1] Verify the import:"
  echo "      docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c '\\dt'"
  echo ""
  echo "[2] Restart the backend to reconnect:"
  echo "      docker compose restart api-backend"
else
  log_error "Import failed!"
  exit 1
fi
