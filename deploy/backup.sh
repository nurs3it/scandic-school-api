#!/usr/bin/env bash
# Daily DB dump, 7 days kept. Cron: 30 3 * * * /opt/scandic-school/deploy/backup.sh
# ponytail: dumps and files/ stay on this VPS; copy off-host if the disk is a risk.
set -euo pipefail
cd /opt/scandic-school
mkdir -p backups
OUT="backups/scandic-$(date +%Y%m%d-%H%M%S).sql.gz"
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db pg_dump -U scandic scandic | gzip > "$OUT.partial"
[ "$(stat -c%s "$OUT.partial")" -gt 1024 ] || { echo "backup too small" >&2; rm -f "$OUT.partial"; exit 1; }
mv "$OUT.partial" "$OUT"
find backups -name 'scandic-*.sql.gz' -mtime +7 -delete
echo "backup ok: $OUT"
