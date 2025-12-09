#!/usr/bin/env bash
# Automated Database Backup Script
# Creates daily backups and cleans up old ones
# Usage: ./auto-backup.sh [RETENTION_DAYS]
#
# Add to crontab for automatic backups:
# 0 2 * * * /var/www/kdongs-mono/docker/postgres/scripts/auto-backup.sh >> /var/log/kdongs-backup.log 2>&1

set -euo pipefail

# --- CONFIG ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/../../../backups}"
RETENTION_DAYS="${1:-7}"  # Keep backups for 7 days by default
# ----------------

echo "========================================="
echo "Automated Database Backup"
echo "========================================="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Backup Directory: $BACKUP_DIR"
echo "Retention: $RETENTION_DAYS days"
echo "========================================="

# Create backup using export script
BACKUP_NAME="auto-backup-$(date +%Y%m%d-%H%M%S)"
"$SCRIPT_DIR/export-database.sh" "$BACKUP_DIR" "$BACKUP_NAME"

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
