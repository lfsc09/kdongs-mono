#!/bin/sh
set -e

# Load secrets from docker
echo -e "[INFO] Loading docker secrets..."
export DB_PASSWORD=$(cat /run/secrets/root_pass)

# Generate application key
echo -e "[INFO] Generating application key..."
export APP_KEY=$(node ace generate:key --show | awk '{print $3}')

# Run migrations & seeding
echo -e "[INFO] Running migrations & seeding..."
node ace migration:fresh --seed --force

exec "$@"
