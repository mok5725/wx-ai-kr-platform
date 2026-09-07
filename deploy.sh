#!/usr/bin/env bash
# wx.ai.kr 플랫폼 배포: 저장소 최신화 → 최신 이미지 pull → 기동. 서버 빌드 없음.
#
# ⚠ 본문 전체를 { } 로 묶은 이유 — 이 스크립트는 실행 도중 git pull 로 **자기 자신**을
#   갈아끼운다. bash 는 스크립트를 조금씩 읽어가며 실행하므로, 파일이 중간에 바뀌면
#   지금까지 읽은 바이트 위치부터 새 파일을 이어 읽어 엉뚱한 줄을 실행한다.
#   { } 로 묶으면 bash 가 닫는 } 까지 한 번에 읽고 파싱한 뒤 실행하므로 안전하다.
#   → 이 파일을 고칠 때 { } 를 걷어내지 말 것.
{
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "ERROR: .env 없음. cp .env.example .env 후 값 채우기." >&2; exit 1; }

# 정적 사이트(hub·claude·hackathon*)와 Caddyfile·docker-compose 는 이미지가 아니라 이
# 저장소의 파일이다. pull 하지 않으면 배포 키로 아무리 돌려도 화면이 안 바뀐다 —
# 2026-09-08 에 hackathon3 가 정확히 여기 걸렸다(새 도메인이라 Caddy 가 블록을 몰라
# 인증서조차 못 냈다). deploy-wx.bat 이 화면에 약속하는 "pull latest code" 가 이 줄이다.
# 실패해도 나머지는 계속한다 — 예전처럼 이미지 갱신만이라도 되도록.
echo "▶ 저장소 최신화…"
before=$(git rev-parse --short HEAD 2>/dev/null || echo "?")
if git pull --ff-only; then
  after=$(git rev-parse --short HEAD 2>/dev/null || echo "?")
  if [ "$before" = "$after" ]; then echo "  변경 없음 ($after)"; else echo "  $before → $after"; fi
else
  echo "  ⚠ git pull 실패 — 저장소는 $before 그대로다. 정적 사이트·Caddyfile 변경은 반영되지 않았다." >&2
fi

echo "▶ compose 정의 검증…"
docker compose config >/dev/null
echo "▶ 최신 이미지 pull…"
docker compose pull
echo "▶ 기동…"
docker compose up -d
echo "▶ 상태:"
docker compose ps
echo "✔ 완료. https://lab.wx.ai.kr / lms / talk / wx.ai.kr 확인."
}
