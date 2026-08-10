# 이 폴더의 폰트

세 폰트 모두 **SIL Open Font License 1.1** 이다. 자체 호스팅과 웹 배포가
허용된다. 금지되는 것은 폰트 파일 자체를 파는 것과 라이선스를 바꾸는 것뿐이다.

OFL은 폰트를 재배포할 때 라이선스 전문을 함께 두도록 요구한다. 이 덱을
웹 서버에 올리는 것이 곧 재배포이므로 이 폴더를 통째로 함께 올린다.

## 페이퍼로지 (Paperlogy)

| | |
|---|---|
| 파일 | `Paperlogy-7Bold.woff2`, `Paperlogy-9Black.woff2` |
| 만든 사람 | 이주임 × 김도균 |
| 배포 | 눈누 (Project Noonnu) — https://noonnu.cc/font_page/1456 |
| 라이선스 | SIL Open Font License 1.1 |
| 웹폰트 탑재 | 허용 (배포처가 "웹사이트 및 프로그램 서버 내 폰트 탑재 사용 가능"으로 명시) |
| 상업적 이용 | 허용 |

OFL 1.1 전문은 `NanumSquare-LICENSE.txt`에 들어 있는 것과 같은 문서다
(원문: https://scripts.sil.org/OFL). 저작권자만 위 표와 같이 다르다.

## 나눔스퀘어 (NanumSquare)

| | |
|---|---|
| 파일 | `NanumSquareR.woff2`, `NanumSquareB.woff2`, `NanumSquareEB.woff2` |
| 저작권 | © 2010 NAVER Corporation |
| 라이선스 | SIL Open Font License 1.1 — 전문은 `NanumSquare-LICENSE.txt` |
| 웹 배포 | 허용 |

## 개구 (Gaegu) — 손글씨

| | |
|---|---|
| 파일 | `Gaegu-Bold-board.woff2` |
| 만든 사람 | 윤디자인 (Yoon Design) |
| 배포 | Google Fonts — https://fonts.google.com/specimen/Gaegu |
| 라이선스 | SIL Open Font License 1.1 |
| 웹 배포 | 허용 |

**쓰이는 곳은 팀 빌딩 보드(`#8/3`) 한 장뿐이다.** 유성매직으로 눌러 쓴
느낌을 내려고 넣었다. 원본은 2.9MB짜리 한글 폰트라 그대로 얹으면 인터넷
없이 뜨는 덱에 무겁다 — **보드에 실제로 쓰인 114자만 남겨 19KB로 줄였다.**

> 보드 문구를 고치면 **없는 글자가 네모로 뜬다.** 그때는 원본을 다시 받아
> 새 글자 목록으로 다시 잘라야 한다:
> ```
> python -m fontTools.subset Gaegu-Bold.ttf --text-file=글자목록.txt >   --flavor=woff2 --layout-features='' --no-hinting --desubroutinize >   --output-file=Gaegu-Bold-board.woff2
> ```

## 원본 파일

`woff2`는 웹 배포용이다. 원본 TTF/OTF는 저장소 루트의 `nanum-square/`와
`Paperlogy-1.000/`에 있다. 다른 굵기가 필요해지면 거기서 가져다
woff2로 변환한다.
