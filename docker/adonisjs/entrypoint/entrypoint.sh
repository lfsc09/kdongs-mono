#!/bin/sh
set -e

echo "🚀 Starting AdonisJS container..."

# Load DB password from Docker secret
if [ -f /run/secrets/root_pass ]; then
    export DB_PASSWORD=$(cat /run/secrets/root_pass)
    echo "✅ Database password loaded from secret"
else
    echo "⚠️  Warning: No DB password secret found"
fi

# Load APP_KEY from Docker secret (generated during bootstrap)
if [ -f /run/secrets/app_key ]; then
    export APP_KEY=$(cat /run/secrets/app_key)
    echo "✅ APP_KEY loaded from secret"
else
    echo "❌ Error: APP_KEY secret not found!"
    echo "   Run: openssl rand -base64 32 > docker/secrets/app_key"
    exit 1
fi

# Wait for database to be ready
echo "⏳ Waiting for database..."
timeout 30 sh -c 'until nc -z $DB_HOST $DB_PORT; do sleep 1; done' || {
    echo "❌ Database connection timeout"
    exit 1
}
echo "✅ Database is ready"

# Run migrations (only run, don't fresh!)
echo "📊 Running database migrations..."
node ace migration:run --force

echo "✅ Container ready!"
exec "$@"
