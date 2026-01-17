#!/usr/bin/env bash
# Automated Database Backup Script
# Creates daily backups and cleans up old ones
# Usage: [BACKUP_DIR=<backup-dir>] [DB_NAME=<db-name>] [DB_USER=<db-user>] ./auto-backup.sh [retention-days]
#
# Examples:
#   ./auto-backup.sh                             # Backup with 7 days retention
#   ./auto-backup.sh 14                          # Backup with 14 days retention
#   BACKUP_DIR=/custom/path ./auto-backup.sh     # Custom backup directory with 7 days retention
#   DB_NAME=mydb DB_USER=dbuser ./auto-backup.sh # Custom DB and user with 7 days retention
#
# Cron Job Example (runs daily at 2 AM):
# 0 2 * * * /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh >> /var/log/kdongs-backup.log 2>&1                             # Default values
# 0 2 * * * /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh 14 >> /var/log/kdongs-backup.log 2>&1                          # 14 days retention
# 0 2 * * * BACKUP_DIR=/custom/path /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh >> /var/log/kdongs-backup.log 2>&1     # Custom backup directory
# 0 2 * * * DB_NAME=mydb DB_USER=dbuser /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh >> /var/log/kdongs-backup.log 2>&1 # Custom DB and user
#
# Parameters:
#   retention-days : Number of days to keep backups (optional, default: 7)
#
# Environment Variables:
#   BACKUP_DIR : Backup directory (optional, default: $HOME/backups)
#   DB_NAME    : Database name (optional, default: app)
#   DB_USER    : Database user (optional, default: adonisjs)
#
# This script does the following:
#   1. Creates a database backup using export-database.sh
#   2. Cleans up backups older than the specified retention period
#

set -euo pipefail

# --- CONFIG ---
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
DB_NAME="${DB_NAME:-app}"
DB_USER="${DB_USER:-adonisjs}"
RETENTION_DAYS="${1:-7}"

DB_CONTAINER_NAME="kdongs-api-postgres"
REPO_DIR="$HOME/kdongs-mono"
SCRIPT_DIR="$REPO_DIR/docker/postgres/scripts"
# ----------------

echo "========================================="
echo "Automated Database Backup"
echo "========================================="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "DB Container: $DB_CONTAINER_NAME"
echo "Backup Directory: $BACKUP_DIR"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Retention: $RETENTION_DAYS days"
echo "========================================="

# Check if DB_NAME and DB_USER are provided
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  log_error "Database name and user must be specified."
  echo ""
  echo "Usage: $0 <db-name> <db-user> [retention-days]"
  exit 1
fi

# Create backup using export script
CONTAINER_NAME="$DB_CONTAINER_NAME" DB_NAME="$DB_NAME" DB_USER="$DB_USER" "$SCRIPT_DIR/export-database.sh" "auto-backup" "$BACKUP_DIR"

# Clean up old backups
echo ""
echo "[INFO] Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "auto-backup-*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -print -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "auto-backup-*.sql.gz" -type f | wc -l)
echo -e "\033[0;32m[OK]\033[0m Cleanup complete. $BACKUP_COUNT backups remaining."

echo "========================================="
echo "Backup completed successfully at $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="
