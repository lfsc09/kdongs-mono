#!/usr/bin/env bash
# Database Export Script
# Exports PostgreSQL database to a backup file
# Usage: ./export-database.sh [BACKUP_DIR] [BACKUP_NAME]

set -euo pipefail

# --- CONFIG ---
CONTAINER_NAME="kdongs-api-postgres"
DB_NAME="app"
DB_USER="adonisjs"
BACKUP_DIR="${1:-./backups}"
BACKUP_NAME="${2:-backup-$(date +%Y%m%d-%H%M%S)}"
# ----------------

echo "========================================="
echo "PostgreSQL Database Export"
echo "========================================="
echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Backup Directory: $BACKUP_DIR"
echo "Backup Name: $BACKUP_NAME"
echo "========================================="

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Error: Container '$CONTAINER_NAME' is not running."
  echo "   Start the container first with: docker compose up -d"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.sql.gz"

echo "📦 Creating backup..."
echo "   Output: $BACKUP_FILE"

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
  echo "✅ Backup created successfully!"
  echo "   File: $BACKUP_FILE"
  echo "   Size: $BACKUP_SIZE"
  echo ""
  echo "📋 To restore this backup, use:"
  echo "   ./import-database.sh $BACKUP_FILE"
else
  echo "❌ Error: Backup failed!"
  exit 1
fi

echo "========================================="
