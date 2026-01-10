#!/bin/bash
set -e

if [ -z "$POSTGRES_DB" ]; then
  echo "[ERROR] POSTGRES_DB environment variable is not set."
  exit 1
fi
if [ -z "$POSTGRES_USER" ]; then
  echo "[ERROR] POSTGRES_USER environment variable is not set."
  exit 1
fi

##
# Enable the pg_stat_statements extension
##
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOS
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
EOS

printf "[OK] Enabled pg_stat_statements extension for database %s...\n" "$POSTGRES_DB"
