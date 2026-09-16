#!/usr/bin/env bash
# wx.ai.kr 통합 플랫폼 백업.
#   - 두 Postgres DB 논리덤프(pg_dump -Fc, 압축·pg_restore 호환)
#   - 앱 데이터(lab 이미지/시드, dx 업로드 등) tar.gz
# 산출물: ./backups/<YYYYmmdd-HHMMSS>/, 완료본 최근 BACKUP_KEEP(기본 3)개만 보존.
# DB 비밀은 스크립트에 없음 — 컨테이너 내부 $POSTGRES_USER/$POSTGRES_DB 사용.
#
# ⚠ backups/ 는 운영 DB 데이터와 같은 디스크(/opt/dx, 20GB)에 있다.
#   2026-09-17 백업 14벌(1벌 ~1.2GB)이 디스크를 채워 dx-db 가 PANIC 으로 멈췄다(lms 로그인 전면 장애).
#   그래서 백업이 운영 DB 를 죽이는 일이 다시 없도록:
#   1) 도중에 실패해 남은 미완료 디렉터리(SHA256SUMS 없음)는 먼저 지운다.
#   2) 새 백업을 만들기 "전에" 완료본을 KEEP-1 개로 회전해, 디스크 위 최대치를 KEEP 벌로 묶는다.
#   3) 여유 공간이 (직전 백업 크기 + 예비 BACKUP_RESERVE_KB) 보다 적으면 백업을 건너뛰고 실패 종료한다.
#   4) 이번 백업이 도중에 실패하면 만들던 디렉터리를 지운다.
#
# 실행(서버, /opt/dx/platform): sudo bash scripts/backup.sh
# 복원: docs 참조 — pg_restore -c -d <db> <svc>.dump / tar xzf <svc>-app.tar.gz -C data
set -euo pipefail
shopt -s nullglob

cd "$(dirname "$0")/.."            # → /opt/dx/platform
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/$STAMP"
KEEP="${BACKUP_KEEP:-3}"
RESERVE_KB="${BACKUP_RESERVE_KB:-2097152}"   # 백업 후에도 남길 여유(기본 2GB) — DB 가 쓸 공간
(( KEEP >= 1 )) || KEEP=1
mkdir -p backups

dirs_newest_first () {             # backups/ 하위 디렉터리, 최신순
  local dirs=(backups/*/)
  (( ${#dirs[@]} )) || return 0
  ls -1dt "${dirs[@]}"
}

complete_newest_first () {         # 완료본(SHA256SUMS 있음)만, 최신순
  local d
  for d in $(dirs_newest_first); do
    if [[ -f "${d}SHA256SUMS" ]]; then echo "$d"; fi
  done
}

keep_newest_complete () {          # $1 = 남길 완료본 개수. 나머지 완료본 삭제
  local n=0 d
  for d in $(complete_newest_first); do
    n=$((n + 1))
    if (( n > $1 )); then
      echo "[backup] 회전 삭제: $d"
      rm -rf "$d"
    fi
  done
}

# 1) 미완료 정리
for d in $(dirs_newest_first); do
  if [[ ! -f "${d}SHA256SUMS" ]]; then
    echo "[backup] 미완료 백업 삭제: $d"
    rm -rf "$d"
  fi
done

# 2) 사전 회전 — 새 백업이 들어갈 자리를 먼저 비운다(최소 1개는 항상 남김)
PRE_KEEP=$(( KEEP > 1 ? KEEP - 1 : 1 ))
keep_newest_complete "$PRE_KEEP"

# 3) 여유 공간 확인 — 부족하면 운영 DB 보호를 위해 건너뜀
LAST_KB=0
# 주의: `complete_newest_first | head -n 1` 은 pipefail 하에서 SIGPIPE(141)로 스크립트를 죽인다
# (완료본이 2개 이상이면 head 가 먼저 닫음). 배열로 받는다.
mapfile -t COMPLETE < <(complete_newest_first)
LATEST="${COMPLETE[0]:-}"
if [[ -n "$LATEST" ]]; then
  LAST_KB="$(du -sk "$LATEST" | cut -f1)"
fi
NEED_KB=$(( LAST_KB + RESERVE_KB ))
AVAIL_KB="$(df -Pk backups | awk 'NR==2 {print $4}')"
if (( AVAIL_KB < NEED_KB )); then
  echo "[backup] 여유 공간 부족 — 백업 건너뜀 (여유 ${AVAIL_KB}KB < 필요 ${NEED_KB}KB: 직전 백업 ${LAST_KB}KB + 예비 ${RESERVE_KB}KB)" >&2
  exit 1
fi

# 4) 백업 생성 — 도중 실패 시 만들던 디렉터리 삭제
mkdir -p "$OUT"
DONE=0
on_exit () {
  if (( DONE == 0 )); then
    echo "[backup] 실패 — 미완료 $OUT 삭제" >&2
    rm -rf "$OUT"
  fi
}
trap on_exit EXIT

dump_db () {                       # $1 = compose 서비스명
  echo "[backup] pg_dump $1"
  docker compose exec -T "$1" sh -c \
    'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$OUT/$1.dump"
}

archive () {                       # $1 = data 하위 디렉터리
  echo "[backup] tar $1"
  tar czf "$OUT/$1.tar.gz" -C data "$1"
}

echo "[backup] $STAMP 시작 (보관 ${KEEP}개, 여유 ${AVAIL_KB}KB)"
dump_db lab-db
dump_db dx-db
archive lab-app
archive dx-app

echo "[backup] 체크섬"
( cd "$OUT" && sha256sum ./* > SHA256SUMS )
DONE=1

# 5) 최종 회전(안전망): 완료본 최신 KEEP 개만
keep_newest_complete "$KEEP"

echo "[backup] 완료 → $OUT ($(du -sh "$OUT" | cut -f1))"
