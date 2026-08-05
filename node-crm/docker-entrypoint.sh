#!/bin/sh
set -e

pnpm run db:migrate:deploy
exec node dist/src/server.js
