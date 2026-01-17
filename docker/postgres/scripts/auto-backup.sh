#!/usr/bin/env bash
# Automated Database Backup Script
# Creates daily backups and cleans up old ones
# Usage: ./auto-backup.sh [DB_NAME] [DB_USER] [RETENTION_DAYS]
#
# Add to crontab for automatic backups:
# 0 2 * * * /home/<vps-user>/kdongs-mono/docker/postgres/scripts/auto-backup.sh <db-name> <db-user> <retention-days> >> /var/log/kdongs-backup.log 2>&1

set -euo pipefail

# --- CONFIG ---
REPO_DIR="$HOME/kdongs-mono"
SCRIPT_DIR="$REPO_DIR/docker/postgres/scripts"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
DB_NAME="${1:-}"
DB_USER="${2:-}"
RETENTION_DAYS="${3:-7}"  # Keep backups for 7 days by default
# ----------------

echo "========================================="
echo "Automated Database Backup"
echo "========================================="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
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
BACKUP_NAME="auto-backup-$(date +%Y%m%d-%H%M%S)"
"$SCRIPT_DIR/export-database.sh" "$DB_NAME" "$DB_USER" "$BACKUP_DIR" "$BACKUP_NAME"

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
