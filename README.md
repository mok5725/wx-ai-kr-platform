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

## 백업
```bash
sudo bash scripts/backup.sh          # 두 DB 논리덤프 + 앱데이터 tar → ./backups/<날짜>/
```
자동화(root 크론, 매일 03:30):
```bash
sudo mkdir -p /opt/dx/platform/backups
( sudo crontab -l 2>/dev/null; \
  echo '30 3 * * * bash /opt/dx/platform/scripts/backup.sh >> /opt/dx/platform/backups/backup.log 2>&1' ) \
  | sudo crontab -
```
최근 14개 보존(회전). `backups/`는 암호화 마운트 내부 — **오프사이트 사본**은 다른 PC에서
`scp -r deploy@<VPS_IP>:/opt/dx/platform/backups/<날짜> .` 로 외부 저장매체에 주기적으로 당겨둔다.

### 복원
```bash
# DB: 컨테이너로 덤프를 흘려넣어 복원(-c = 기존 객체 정리 후)
docker compose exec -T lab-db sh -c 'pg_restore -c -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < lab-db.dump
docker compose exec -T dx-db  sh -c 'pg_restore -c -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < dx-db.dump
# 앱 데이터: 스택 정지 후 풀기
docker compose down && tar xzf lab-app.tar.gz -C data && tar xzf dx-app.tar.gz -C data && docker compose up -d
```

## 트러블슈팅
- TLS 실패: DNS가 VPS IP로 가는지, 80/443(ufw+카페24 보안그룹) 열렸는지.
- 로그: `docker compose logs -f edge|lab|dx`.
- 상태: `docker compose ps` (모두 healthy/running).
