#!/usr/bin/env python3
# 일회성 컷오버 헬퍼: dx 기존 /opt/dx/.env 값을 통합 .env 의 DX_* 로 옮기고
# lab 비밀을 새로 생성해 /opt/dx/platform/.env 를 만든다. (sudo 로 실행)
import secrets, os, pwd, sys

SRC = "/opt/dx/.env"
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")

if not os.path.exists(SRC):
    sys.exit(f"ERROR: {SRC} 를 찾을 수 없습니다.")

dx = {}
with open(SRC) as f:
    for line in f:
        line = line.rstrip("\n")
        if not line or line.lstrip().startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        dx[k.strip()] = v

m = {
    "POSTGRES_USER": "DX_POSTGRES_USER", "POSTGRES_PASSWORD": "DX_POSTGRES_PASSWORD",
    "POSTGRES_DB": "DX_POSTGRES_DB", "JWT_SECRET": "DX_JWT_SECRET",
    "JWT_EXPIRE_HOURS": "DX_JWT_EXPIRE_HOURS", "ENCRYPTION_KEY": "DX_ENCRYPTION_KEY",
    "INITIAL_ADMIN_EMAIL": "DX_INITIAL_ADMIN_EMAIL", "INITIAL_ADMIN_PASSWORD": "DX_INITIAL_ADMIN_PASSWORD",
    "OPENAI_API_KEY": "DX_OPENAI_API_KEY", "OPENAI_MODEL": "DX_OPENAI_MODEL",
    "GEMINI_API_KEY": "DX_GEMINI_API_KEY", "admin_id": "DX_BOARD_ADMIN_ID",
    "admin_pw": "DX_BOARD_ADMIN_PW", "secret_key": "DX_BOARD_SECRET_KEY",
    "session_hours": "DX_BOARD_SESSION_HOURS",
}

out = {"LAB_IMAGE_TAG": "latest", "DX_IMAGE_TAG": "latest"}
for sk, dk in m.items():
    if sk in dx:
        out[dk] = dx[sk]

lab_admin = secrets.token_urlsafe(12)
out.update({
    "LAB_POSTGRES_USER": "wxuser", "LAB_POSTGRES_PASSWORD": secrets.token_urlsafe(24),
    "LAB_POSTGRES_DB": "wxdb", "LAB_JWT_SECRET": secrets.token_urlsafe(32),
    "LAB_JWT_EXPIRE_HOURS": "12", "LAB_ADMIN_PASSWORD": lab_admin,
})

with open(DST, "w") as f:
    for k, v in out.items():
        f.write(f"{k}={v}\n")

# 권한: deploy 소유 + 600
os.chmod(DST, 0o600)
try:
    d = pwd.getpwnam("deploy")
    os.chown(DST, d.pw_uid, d.pw_gid)
except KeyError:
    pass

print("=== .env DONE:", DST, "===")
print("moved from dx:", ", ".join(dk for sk, dk in m.items() if sk in dx))
miss = [sk for sk in m if sk not in dx]
print("missing in dx (skipped):", ", ".join(miss) if miss else "none")
print()
print(">>> LAB ADMIN PASSWORD (save this!):", lab_admin)
