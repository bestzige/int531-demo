#!/bin/sh
set -e

echo "[app] wait mariadb:3306..."
npx wait-port mariadb:3306 --timeout=60 -- echo ready

echo "[app] generate migrations (drizzle-kit)..."
npx drizzle-kit generate --schema=./src/db/schema.ts --out=./drizzle --dialect=mysql || true

echo "[app] apply migrations..."
DATABASE_URL="$DATABASE_URL" npx drizzle-kit migrate || true

echo "[app] start server"
exec node server.js