#!/usr/bin/env bash
# Database Import Script
# Imports PostgreSQL database from a backup file
# Usage: ./import-database.sh [BACKUP_FILE]

set -euo pipefail

# --- CONFIG ---
CONTAINER_NAME="kdongs-api-postgres"
DB_NAME="app"
DB_USER="adonisjs"
BACKUP_FILE="${1:-}"
# ----------------

echo "========================================="
echo "PostgreSQL Database Import"
echo "========================================="

# Check if backup file was provided
if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Error: No backup file specified."
  echo ""
  echo "Usage: $0 <backup-file>"
  echo ""
  echo "Example:"
  echo "  $0 ./backups/backup-20241209-120000.sql.gz"
  exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Backup File: $BACKUP_FILE"
echo "========================================="

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Error: Container '$CONTAINER_NAME' is not running."
  echo "   Start the container first with: docker compose up -d"
  exit 1
fi

# Confirm before proceeding
echo ""
echo "⚠️  WARNING: This will REPLACE the current database with the backup!"
echo "   Current database '$DB_NAME' will be dropped and recreated."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Import cancelled."
  exit 0
fi

echo ""
echo "📥 Importing backup..."

# Detect if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "   Detected compressed backup (gzip)"
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql \
    --username="$DB_USER" \
    --dbname="postgres"
else
  echo "   Detected uncompressed backup"
  cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql \
    --username="$DB_USER" \
    --dbname="postgres"
fi

if [ $? -eq 0 ]; then
  echo "✅ Database imported successfully!"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Verify the import:"
  echo "      docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c '\\dt'"
  echo ""
  echo "   2. Restart the backend to reconnect:"
  echo "      docker compose restart api-backend"
else
  echo "❌ Error: Import failed!"
  exit 1
fi

echo "========================================="
