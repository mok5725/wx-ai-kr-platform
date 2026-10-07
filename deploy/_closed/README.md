# 임시로 닫아 둔 사이트 (2026-10-07)

행사가 끝난 덱 네 벌을 **주소로 들어갈 수 없게** 치워 둔 곳이다.
Caddy 가 보는 경로는 `deploy/hackathon*` · `deploy/hub` 뿐이고 여기(`deploy/_closed`)는
어디에도 마운트되지 않는다. 그래서 파일은 그대로 남아 있지만 웹에서는 닿지 않는다.

| 보관함 | 원래 자리 | 주소 |
|---|---|---|
| `hackathon`  | `deploy/hackathon`  | hackathon.wx.ai.kr |
| `hackathon2` | `deploy/hackathon2` | hackathon2.wx.ai.kr |
| `hackathon3` | `deploy/hackathon3` | hackathon3.wx.ai.kr · hackathon.wx.ai.kr/main · /master |
| `recap`      | `deploy/hub/recap`  | wx.ai.kr/recap/ |

원래 자리는 **빈 폴더**다 — `.gitkeep` 한 개뿐이다(git 이 빈 폴더를 남기지 못해서 둔 것).
index.html 이 없으므로 `/` 를 포함한 **모든 경로가 404** 다. 안내문도 띄우지 않는다.

## 다시 열기

```bash
cd /e/wx-ai-kr/platform
rm -rf deploy/hackathon deploy/hackathon2 deploy/hackathon3 deploy/hub/recap
git mv deploy/_closed/hackathon  deploy/hackathon
git mv deploy/_closed/hackathon2 deploy/hackathon2
git mv deploy/_closed/hackathon3 deploy/hackathon3
git mv deploy/_closed/recap      deploy/hub/recap
git commit -m "chore: 임시 폐쇄 해제"
git push
```
그 다음 `E:\wx-ai-kr\deploy-wx.bat` 더블클릭.

## ⚠ 주의

`인창원라이브_발표\배포.bat`(= `deploy-recap.sh`)을 돌리면 `deploy/hub/recap` 이
**다시 채워져 사이트가 열린다.** 닫아 둔 동안에는 그 배포를 돌리지 말 것.
