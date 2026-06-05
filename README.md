# wx-ai-kr-platform (단일 컨트롤 플레인)

한 폴더(`/opt/wx-ai-kr`)에서 lab·lms·talk·허브를 모두 제어한다. 어느 PC든
`ssh deploy@<VPS_IP>` 후 이 폴더에서 동일하게 운영한다.

## 구성
- `edge`(Caddy): 80/443, 4도메인 라우팅 + 자동 TLS + 허브 정적 서빙
- `lab`/`dx`: GHCR 프리빌트 이미지(서버 빌드 없음)
- `lab-db`/`dx-db`: 각 앱 전용 Postgres(내부 망 전용)
- 영속 상태: `./data/*` (LUKS 암호화 마운트)

## 최초 배포
```bash
cd /opt/wx-ai-kr
cp .env.example .env && nano .env     # 모든 비밀 입력
# (GHCR 패키지가 private면) docker login ghcr.io 1회
./deploy.sh
```

## 재배포(이미지 갱신 후)
```bash
cd /opt/wx-ai-kr && ./deploy.sh        # pull + up -d
```
특정 버전 고정: `.env`의 `LAB_IMAGE_TAG`/`DX_IMAGE_TAG`를 `sha-XXXXXXX`로.

## 롤백
```bash
# .env 의 *_IMAGE_TAG 를 직전 정상 sha 로 → ./deploy.sh
# 또는 컷오버 직후 통합 스택 실패 시: docker compose down 후 /opt/dx 원복(컷오버 절차 참조)
```

## 트러블슈팅
- TLS 실패: DNS가 VPS IP로 가는지, 80/443(ufw+카페24 보안그룹) 열렸는지.
- 로그: `docker compose logs -f edge|lab|dx`.
- 상태: `docker compose ps` (모두 healthy/running).
