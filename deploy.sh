#!/usr/bin/env bash
# wx.ai.kr 플랫폼 배포: 최신 이미지 pull 후 기동. 서버 빌드 없음.
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "ERROR: .env 없음. cp .env.example .env 후 값 채우기." >&2; exit 1; }
echo "▶ compose 정의 검증…"
docker compose config >/dev/null
echo "▶ 최신 이미지 pull…"
docker compose pull
echo "▶ 기동…"
docker compose up -d
echo "▶ 상태:"
docker compose ps
echo "✔ 완료. https://lab.wx.ai.kr / lms / talk / wx.ai.kr 확인."
