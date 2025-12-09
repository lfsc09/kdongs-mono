#!/usr/bin/env bash
# Manual Deployment Script
# Deploys the application to the VPS server
# Usage: ./deploy.sh [TAG]

set -euo pipefail

# --- CONFIG ---
TAG="${1:-}"
DOCKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../docker" && pwd)"
# ----------------

echo "========================================="
echo "Kdongs Manual Deployment"
echo "========================================="

# Check if we're in the docker directory
if [ ! -f "$DOCKER_DIR/compose.yaml" ]; then
  echo "❌ Error: docker/compose.yaml not found"
  exit 1
fi

cd "$DOCKER_DIR"

# If tag is specified, checkout that tag
if [ -n "$TAG" ]; then
  echo "📌 Checking out tag: $TAG"
  cd ..
  git fetch --all --tags
  git checkout "tags/$TAG"
  cd docker
else
  echo "📌 Using current working directory state"
fi

# Create backup before deployment
echo "💾 Creating database backup..."
BACKUP_DIR="../backups"
mkdir -p "$BACKUP_DIR"
./postgres/scripts/export-database.sh "$BACKUP_DIR" "pre-deploy-$(date +%Y%m%d-%H%M%S)" || echo "⚠️  Backup skipped (database not running)"

# Confirm before proceeding
echo ""
echo "⚠️  This will rebuild and restart all containers."
echo ""
read -p "Continue with deployment? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Deployment cancelled."
  exit 0
fi

# Build and deploy
echo ""
echo "🔨 Building containers..."
docker compose build --no-cache

echo ""
echo "🛑 Stopping old containers..."
docker compose down

echo ""
echo "🚀 Starting new containers..."
docker compose up -d

# Wait for services
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "📊 Container Status:"
docker compose ps

# Show logs
echo ""
echo "📋 Recent Logs:"
docker compose logs --tail=50

echo ""
echo "========================================="
echo "✅ Deployment completed!"
echo "========================================="
echo ""
echo "📋 Next steps:"
echo "   - Check logs: docker compose logs -f"
echo "   - Check health: curl http://localhost:8000/health"
echo "   - Rollback if needed: docker compose down && git checkout main"
echo "========================================="
