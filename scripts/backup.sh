#!/usr/bin/env bash
# wx.ai.kr 통합 플랫폼 백업.
#   - 두 Postgres DB 논리덤프(pg_dump -Fc, 압축·pg_restore 호환)
#   - 앱 데이터(lab 이미지/시드, dx 업로드 등) tar.gz
# 산출물: ./backups/<YYYYmmdd-HHMMSS>/, 최근 BACKUP_KEEP(기본 14)개만 보존.
# DB 비밀은 스크립트에 없음 — 컨테이너 내부 $POSTGRES_USER/$POSTGRES_DB 사용.
#
# 실행(서버, /opt/dx/platform): sudo bash scripts/backup.sh
# 복원: docs 참조 — pg_restore -c -d <db> <svc>.dump / tar xzf <svc>-app.tar.gz -C data
set -euo pipefail

cd "$(dirname "$0")/.."            # → /opt/dx/platform
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/$STAMP"
KEEP="${BACKUP_KEEP:-14}"
mkdir -p "$OUT"

dump_db () {                       # $1 = compose 서비스명
  echo "[backup] pg_dump $1"
  docker compose exec -T "$1" sh -c \
    'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$OUT/$1.dump"
}

archive () {                       # $1 = data 하위 디렉터리
  echo "[backup] tar $1"
  tar czf "$OUT/$1.tar.gz" -C data "$1"
}

echo "[backup] $STAMP 시작"
dump_db lab-db
dump_db dx-db
archive lab-app
archive dx-app

echo "[backup] 체크섬"
( cd "$OUT" && sha256sum ./* > SHA256SUMS )

# 회전: 최신 KEEP개 디렉터리만 남기고 정리
ls -1dt backups/*/ | tail -n +"$((KEEP + 1))" | xargs -r rm -rf

echo "[backup] 완료 → $OUT ($(du -sh "$OUT" | cut -f1))"
