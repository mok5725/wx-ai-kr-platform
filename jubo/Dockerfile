# 교회 주보 앱(천호 /ch, 가은 /gaeun) 공용 실행 이미지 — 2026-10-17.
# 앱 코드는 이미지에 넣지 않고 ./data/jubo/<앱>/app 을 읽기 전용으로 붙인다(앱마다 따로 배포).
# 서버에서 직접 만든다(GHCR 아님): compose 의 pull_policy: build → deploy.sh 의 pull 에서는 건너뜀.
# LibreOffice = 서버 미리보기·인쇄용 PDF, poppler-utils(pdftoppm) = 미리보기 그림.
# python3-uno = 앱의 app/jubo/lo_convert.py(시스템 파이썬으로 실행)가 LibreOffice를 조종해 파워포인트 모양으로 고쳐 그림.
FROM python:3.12-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends libreoffice-impress-nogui python3-uno poppler-utils fontconfig fonts-nanum \
 && rm -rf /var/lib/apt/lists/*

# (2026-10-19) 버전 고정: compose pull_policy: build라 docker compose up 때마다 다시 만들어짐(lab·lms 배포 포함).
# 그날 고정 없이 다시 만들어진 pymupdf 2.0이 numpy 2.5를 끌어와 이 서버 CPU(QEMU, X86_V2 없음)에서 주보 두 앱이 켜지지 않았음.
# 아래는 그 뒤 잘 도는 판(2026-10-20 0시 확인). 올릴 때는 서버에서 import pymupdf를 먼저 시험.
RUN pip install --no-cache-dir "python-pptx==1.0.2" "fastapi==0.148.0" "starlette==1.9.0" "pydantic==2.14.1" "uvicorn==0.54.0" "pillow==13.0.0" "pymupdf==1.28.2" "lxml==6.1.3" "xlsxwriter==3.2.9"

# 주보 글꼴은 ./data/jubo/fonts 를 /fonts 로 붙인다(글꼴 파일은 저장소에 넣지 않음).
COPY fonts.conf /etc/fonts/conf.d/99-jubo.conf

ENV HOME=/tmp PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 JUBO_FONT_DIR=/fonts
WORKDIR /app
EXPOSE 8000
CMD ["sh", "-c", "fc-cache -f >/dev/null 2>&1; exec python -m uvicorn app.web.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'"]
