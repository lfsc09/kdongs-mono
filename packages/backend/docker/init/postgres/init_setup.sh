#!/bin/bash
set -e

##
# Create the test database
##
if [ -z "$POSTGRES_DB" ]; then
  echo "POSTGRES_DB environment variable is not set."
  exit 1
fi
if [ -z "$POSTGRES_USER" ]; then
  echo "POSTGRES_USER environment variable is not set."
  exit 1
fi

local_db_name="${POSTGRES_DB}-test"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOS
  CREATE DATABASE "$local_db_name";
EOS

printf "✅ Created %s for user %s...\n" "$local_db_name" "$POSTGRES_USER"

##
# Enable the pg_stat_statements extension
##
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOS
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
EOS

printf "✅ Enabled pg_stat_statements extension for database %s...\n" "$POSTGRES_DB"
