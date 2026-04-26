#!/bin/sh
set -e

mkdir -p /app/uploads
chown -R appuser:appgroup /app/uploads
chmod -R u+rwX,g+rwX /app/uploads

exec runuser -u appuser -- "$@"
