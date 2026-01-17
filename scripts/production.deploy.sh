#!/usr/bin/env bash
# Manual Deployment Script
# Manually deploys the application inside the VPS server
# Usage: BACKUP_DIR=<backup_dir> ./production.deploy.sh [DB_NAME] [DB_USER] [TAG|latest]
#
# Examples:
#   ./production.deploy.sh <db-name> <db-user>                             # Deploy latest from main
#   ./production.deploy.sh <db-name> <db-user> latest                      # Deploy latest from main
#   ./production.deploy.sh <db-name> <db-user> v1.2.3                      # Deploy specific tag
#   BACKUP_DIR=/custom ./production.deploy.sh <db-name> <db-user> v1.2.3   # Custom backup dir

set -euo pipefail

# --- CONFIG ---
REPO_DIR="$HOME/kdongs-mono"
DOCKER_DIR="$REPO_DIR/docker"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
DB_NAME="${1:-}"
DB_USER="${2:-}"
TAG="${3:-latest}"
# ----------------

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
echo "Kdongs Manual Deployment"
echo "========================================="

# Check if DB_NAME, DB_USER and TAG are provided
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$TAG" ]; then
  log_error "Usage: $0 [DB_NAME] [DB_USER] [TAG|latest]"
  exit 1
fi

log_info "Checking out to: $TAG"
cd "$REPO_DIR"
git fetch --all --tags
# Checkout to the specified tag or latest
if [ "$TAG" = "latest" ]; then
  log_info "Deploying latest from main branch"
  git checkout main
  git pull origin main
  log_success "Updated to latest main branch"
else
  # Try to checkout as a tag
  if git rev-parse "tags/$TAG" >/dev/null 2>&1; then
    log_info "Checking out release tag: $TAG"
    git checkout "tags/$TAG"
    log_success "Checked out tag: $TAG"
  else
    log_error "Tag '$TAG' not found"
    log_info "Use 'latest' for main branch or provide a valid tag"
    log_info "Available tags:"
    git tag -l | tail -10
    exit 1
  fi
fi

# Create backup before deployment
log_info "Creating database backup..."
mkdir -p "$BACKUP_DIR"
"$DOCKER_DIR/postgres/scripts/export-database.sh" "$DB_NAME" "$DB_USER" "$BACKUP_DIR" "pre-deploy-$(date +%Y%m%d-%H%M%S)" || log_warn "Backup skipped (database not running)"

# Confirm before proceeding
echo ""
log_warn "This will rebuild and restart all containers."
log_info "Backup directory: $BACKUP_DIR"
log_info "Database: $DB_NAME"
log_info "User: $DB_USER"
echo ""
read -p "Continue with deployment? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  log_error "Deployment cancelled."
  exit 0
fi

# Navigate to docker directory
cd "$DOCKER_DIR"

# Build and deploy
echo ""
log_info "Building containers..."
docker compose build --no-cache

echo ""
log_info "Stopping old containers..."
docker compose down

echo ""
log_info "Starting new containers..."
docker compose up -d

# Wait for services
echo ""
log_info "Waiting for services to start..."
sleep 10

# Check status
echo ""
log_info "Container Status:"
docker compose ps

# Show logs
echo ""
log_info "Recent Logs:"
docker compose logs --tail=50

echo ""
log_success "Deployment successful!"
echo ""
log_info "Summary:"
log_info "   Tag: ${TAG:-current}"
log_info "   Backup: $BACKUP_DIR/pre-deploy-*.sql.gz"
log_info "   Database: $DB_NAME"
log_info "   User: $DB_USER"
