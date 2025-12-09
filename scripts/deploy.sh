#!/usr/bin/env bash
# Manual Deployment Script
# Deploys the application to the VPS server
# Usage: ./deploy.sh [TAG]

set -euo pipefail

# --- CONFIG ---
TAG="${1:-}"
DOCKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../docker" && pwd)"
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

# Check if we're in the docker directory
if [ ! -f "$DOCKER_DIR/compose.yaml" ]; then
  log_error "docker/compose.yaml not found"
  exit 1
fi

cd "$DOCKER_DIR"

# If tag is specified, checkout that tag
if [ -n "$TAG" ]; then
  log_info "Checking out tag: $TAG"
  cd ..
  git fetch --all --tags
  git checkout "tags/$TAG"
  cd docker
else
  log_info "Using current working directory state"
fi

# Create backup before deployment
log_info "Creating database backup..."
BACKUP_DIR="../backups"
mkdir -p "$BACKUP_DIR"
./postgres/scripts/export-database.sh "$BACKUP_DIR" "pre-deploy-$(date +%Y%m%d-%H%M%S)" || log_warn "Backup skipped (database not running)"

# Confirm before proceeding
echo ""
log_warn "This will rebuild and restart all containers."
echo ""
read -p "Continue with deployment? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  log_error "Deployment cancelled."
  exit 0
fi

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
