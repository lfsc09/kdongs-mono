#!/bin/bash

###
# Backend setup
###
cd packages/backend || exit 1

# Create project's `.env` and `.env.test` file if they don't exist.
cp .env.example .env && cp .env.test.example .env.test

# Generate an `APP_KEY` in both files
node ace generate:key && KEY=$(node ace generate:key --show | awk '{print $3}') && sed -i "/^APP_KEY=/c\APP_KEY=$KEY" .env.test && grep -q "^APP_KEY=" .env.test || printf "\nAPP_KEY=$KEY" >> .env.test

# Create a random `root` DB user password in `secrets` folder
PASS=$(openssl rand -hex 16) && echo "$PASS" > ../../docker/secrets/postgres_root_pass.txt

# Fill it in `.env` and `.env.test`
PASS=$(cat ../../docker/secrets/postgres_root_pass.txt | tr -d '\n') && for file in .env .env.test; do sed -i '/^DB_PASSWORD=/d' "$file" && printf "\nDB_PASSWORD=$PASS\n" >> "$file"; done

cd - || exit 1
