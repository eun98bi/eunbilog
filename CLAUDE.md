# CLAUDE.md — eunbilog.com 블로그 자동화 지시서

> 이 파일은 Claude Code 에이전트가 eunbilog.com 블로그를 운영하는 데 필요한
> 모든 규칙, 구조, 작업 흐름을 정의한다.
> 새 대화를 시작할 때마다 이 파일을 먼저 읽고 시작할 것.

---

## 1. 프로젝트 개요

- **사이트**: eunbilog.com
- **GitHub**: https://github.com/eun98bi/eunbilog.git
- **구조**: 허브형 — 랜딩(`/`) + 블로그(`/blog`)
- **스택**: Next.js 14 (App Router), MDX, Tailwind CSS, Vercel
- **콘텐츠 저장**: 파일 기반 (`/content/blog/[category]/[slug].mdx`)
- **배포**: git push → Vercel 자동 빌드

---

## 2. 디렉토리 구조

```
eunbilog/
├── app/
│   ├── page.tsx                  # 허브 랜딩
│   ├── blog/
│   │   ├── page.tsx              # 블로그 홈 (전체 글 목록)
│   │   ├── [category]/
│   │   │   ├── page.tsx          # 카테고리 목록
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # 개별 포스트
├── content/
│   └── blog/
│       ├── app-dev/              # 앱 개발기
│       ├── baseball/             # 야구 콘텐츠 + 야구일기
│       ├── tooltoolz/            # ToolToolz 유입
│       ├── affiliate/            # 제휴 콘텐츠 (마이리얼트립·쿠팡·에이블리)
│       ├── gov-info/             # 정부 서류 / 행정 정보
│       └── side-hustle/          # 부업 / 파이프라인
├── lib/
│   └── posts.ts                  # MDX 파싱 유틸리티
├── components/
│   └── blog/
│       ├── PostCard.tsx
│       ├── CategoryBadge.tsx
│       └── AffiliateBlock.tsx    # 제휴 링크 컴포넌트
├── public/
│   └── images/blog/              # 포스트 이미지
├── CLAUDE.md                     # 이 파일
└── content-plan.md               # 콘텐츠 계획 (에이전트가 참조)
```

---

## 3. MDX Frontmatter 스펙

모든 포스트는 아래 frontmatter를 반드시 포함해야 한다.

```yaml
---
title: "제목 (60자 이내, SEO 최적화)"
slug: "url-friendly-slug-in-korean-or-english"
date: "YYYY-MM-DD"
category: "app-dev | baseball | tooltoolz | affiliate | gov-info | side-hustle"
tags: ["태그1", "태그2", "태그3"]  # 3~5개
excerpt: "검색결과·카드에 노출되는 요약 (150자 이내)"
coverImage: "/images/blog/카테고리/slug-cover.jpg"  # 없으면 null
published: true  # false면 초안
affiliate:
  platform: "myrealtrip | coupang | ably | null"
  links:
    - text: "링크 텍스트"
      url: "https://..."
      code: "제휴코드"   # 없으면 생략
seo:
  metaTitle: "메타 제목 (없으면 title 사용)"
  metaDescription: "메타 설명 (없으면 excerpt 사용)"
  keywords: ["키워드1", "키워드2"]
---
```

### 카테고리별 필수 규칙

| 카테고리 | affiliate 값 | 특이사항 |
|---|---|---|
| `app-dev` | null | 개발 과정 솔직하게, 실패도 기록 |
| `baseball` | null | KBO 경기 결과 포함 시 날짜 명시 |
| `tooltoolz` | null | 반드시 tooltoolz.com 링크 포함 |
| `affiliate` | platform 명시 | 제휴 링크 필수, 상단 disclosure 포함 |
| `gov-info` | null | 정확한 출처·날짜 명시 필수 |
| `side-hustle` | null | 실제 수익/결과 수치 포함 권장 |

---

## 4. 에이전트 작업 흐름

### 4-1. 글 작성 요청 시 에이전트 동작 순서

```
1. [Web Search] 주제 관련 최신 정보 검색 (필요 시)
2. [Read] content-plan.md 확인 → 예정 포스트 있는지 체크
3. [Write] /content/blog/[category]/[slug].mdx 생성
4. [Read] 생성된 파일 검토 (frontmatter 누락 없는지 확인)
5. [Bash] git add . && git commit -m "post: [slug]" && git push
6. 완료 보고: 파일 경로 + Vercel 배포 URL 출력
```

### 4-2. 글 작성 명령 형식

에이전트에게 아래 형식으로 지시한다:

```
# 주제 지정형 (기본)
"[카테고리] [주제]로 블로그 글 써줘"

예시:
"baseball 오늘 한화 경기 후기 써줘"
"affiliate 마이리얼트립 오사카 항공권 예약하는 법 써줘"
"gov-info 건강보험료 환급 신청하는 법 써줘"
"app-dev 포도알줍줍 모바일 UI 개선한 개발기 써줘"

# 카테고리만 지정 (주제 자동 탐색)  ← 섹션 4-4 참조
"[카테고리] 글 써줘"
"[카테고리] 뭔가 써줘"
"[카테고리] 알아서 써줘"

예시:
"baseball 글 써줘"      → 오늘 KBO 경기 결과 검색 후 주제 선정
"affiliate 글 써줘"     → 계절·트렌드 기반 제휴 주제 자동 선정
"gov-info 글 써줘"      → 최근 자주 검색되는 행정 정보 주제 선정
"app-dev 글 써줘"       → content-plan.md 예정 항목 또는 최근 작업 기반
"side-hustle 글 써줘"   → 현재 운영 중인 프로젝트 기반 주제 선정

# 추가 옵션 (필요 시 붙이기)
+ "키워드: [SEO 키워드]"
+ "길이: 짧게(700자) | 보통(1500자) | 길게(2500자+)"
+ "톤: 친근하게 | 정보성으로 | 일기체로"
+ "제휴링크: [URL]"
+ "초안으로 저장해줘" (published: false)
+ "주제 3개 보여줘" (자동 탐색 후 선택지 제시, 바로 작성 안 함)
```

### 4-3. 에이전트 자율 판단 기준

에이전트는 아래를 스스로 판단해서 처리한다:

- **slug 생성**: 제목에서 자동 생성, 영문+하이픈 선호, 한글도 허용
- **태그 선택**: 카테고리 + 주제 기반으로 3~5개 자동 생성
- **excerpt 작성**: 본문 첫 단락 기반으로 자동 요약
- **SEO 키워드**: 주제 분석 후 검색량 높을 키워드 3~5개 선택
- **웹 검색 여부**: `gov-info`, `affiliate` 카테고리는 항상 검색 후 작성
  - `baseball`은 당일 경기 글이면 검색, 그 외는 생략
  - `app-dev`, `side-hustle`은 검색 생략 (경험 기반 글)

### 4-4. 주제 자동 탐색 모드 (카테고리만 지정 시)

카테고리만 주어지고 주제가 없으면 에이전트는 아래 순서로 주제를 스스로 찾는다.

#### 탐색 순서

```
1. [Read] content-plan.md → 예정된 미작성 항목 있으면 그것을 첫 번째 후보로
2. [Read] content/blog/[category]/ → 기존 포스트 목록 파악 (중복 방지)
3. [Web Search] 카테고리별 탐색 쿼리 실행 (아래 표 참조)
4. 후보 주제 3개 선정 → 그 중 가장 적합한 1개 자동 선택
5. 선택 이유 한 줄 출력 후 바로 작성 시작
   예: "오늘 한화-KT 경기가 있어서 이 주제로 작성합니다."
```

단, "주제 3개 보여줘" 옵션이 붙으면 선택지만 출력하고 대기한다.

#### 카테고리별 자동 탐색 쿼리

| 카테고리 | 탐색 전략 | 검색 쿼리 예시 |
|---|---|---|
| `baseball` | 오늘 날짜 KBO 경기 결과 우선 | `"KBO 오늘 경기 결과 [날짜]"`, `"한화 이글스 최근 경기"` |
| `affiliate` | 계절·시즌·트렌드 기반 | `"[현재 월] 여행 추천"`, `"요즘 인기 쿠팡 제품"`, `"에이블리 신상"` |
| `gov-info` | 최근 정책 변경·신청 기간 임박 항목 | `"[현재 월] 정부 지원금 신청"`, `"최근 행정 서비스 변경"` |
| `app-dev` | content-plan.md 우선, 없으면 최근 커밋 기반 | `git log --oneline -5` 실행 후 최근 작업 주제 파악 |
| `tooltoolz` | tooltoolz.com 기능 중 아직 소개 안 한 도구 | 기존 포스트 목록 확인 후 미소개 도구 선정 |
| `side-hustle` | 현재 운영 프로젝트 중 공유할 내용 | content-plan.md + 최근 개발 로그 기반 |

#### 주제 선정 기준 (우선순위 순)

1. **시의성** — 오늘 날짜와 연관된 주제 (경기, 마감, 시즌)
2. **계획된 항목** — content-plan.md 예정 목록
3. **검색 수요** — 검색량 높을 것으로 예상되는 주제
4. **중복 없음** — 기존 포스트와 주제 겹치지 않을 것

#### affiliate 카테고리 특별 규칙

주제 자동 탐색 시 플랫폼도 함께 선정한다:

```
현재 월 기준:
- 3~5월: 마이리얼트립 (봄 여행 시즌)
- 6~8월: 에이블리 (여름 패션) + 마이리얼트립 (여름 휴가)
- 9~11월: 마이리얼트립 (단풍·가을 여행) + 쿠팡 (추석 선물)
- 12~2월: 쿠팡 (연말·설날) + 에이블리 (겨울 패션)
```

제휴 링크가 없는 경우 `published: false`로 저장하고 아래 메시지 출력:
```
⚠️ 제휴 링크가 없어 초안으로 저장했습니다.
링크 추가 후 "published: true로 바꿔줘" 라고 말해주세요.
```

---

## 5. 글 스타일 가이드

### 공통
- 1인칭 구어체 ("~했어요", "~더라고요")
- 문단은 3~5문장, 너무 길지 않게
- 소제목(h2, h3) 적극 활용
- 결론/요약 섹션 항상 포함

### 카테고리별 톤

**app-dev**: 개발자 일기 느낌. 막혔던 것, 해결한 것 솔직하게. 코드 블록 포함.

**baseball**: 직관 후기면 감정 위주로. 중계 후기면 경기 흐름 + 하이라이트 장면.
KBO 팀명은 공식명 사용 (한화 이글스, 삼성 라이온즈 등).

**tooltoolz**: "이런 도구 찾다가 내가 만들었어요" 톤으로. 자연스럽게 유입 유도.
본문 중간 + 끝에 tooltoolz.com 링크 최소 2회 삽입.

**affiliate**: 상단에 반드시 disclosure 삽입:
```mdx
> 💡 이 포스트에는 제휴 링크가 포함되어 있어요.
> 링크를 통해 구매하시면 저에게 소정의 수수료가 지급됩니다.
```
경험담처럼 써야 함. 광고 느낌 X.

**gov-info**: 정보 정확성 최우선. 출처 링크 필수. 날짜 명시.
"~카더라" 표현 절대 금지. 마지막에 "변경될 수 있으니 공식 사이트 확인" 문구.

**side-hustle**: 구체적인 수치 포함 권장 (수익, 시간, 비용).
"나도 할 수 있다"는 느낌보다 "이렇게 해봤다"는 기록 느낌.

---

## 6. SEO 체크리스트

에이전트가 파일 생성 전 자동으로 확인:

- [ ] title 60자 이내
- [ ] excerpt 150자 이내
- [ ] 본문에 메인 키워드 자연스럽게 3회 이상 등장
- [ ] h2 소제목 최소 2개
- [ ] 내부 링크 최소 1개 (다른 포스트 또는 eunbilog.com 페이지)
- [ ] affiliate 카테고리: 제휴 링크 disclosure 포함
- [ ] tooltoolz 카테고리: tooltoolz.com 링크 포함

---

## 7. 배포 명령어 참조

```bash
# 글 작성 후 배포
git add content/blog/[category]/[slug].mdx
git commit -m "post: [카테고리] [제목 요약]"
git push origin main

# 여러 글 한번에
git add content/blog/
git commit -m "posts: [글 수]개 포스트 추가"
git push origin main

# 초안 저장만 (배포 안 함)
git add content/blog/[category]/[slug].mdx
git commit -m "draft: [slug]"
git push origin main
# → published: false 상태라 사이트에 노출 안 됨
```

---

## 8. 자주 쓰는 MDX 컴포넌트

```mdx
{/* 제휴 링크 버튼 */}
<AffiliateBlock
  platform="myrealtrip"
  text="마이리얼트립에서 확인하기"
  url="https://www.myrealtrip.com/..."
/>

{/* ToolToolz 유입 배너 */}
<ToolToolzBanner />

{/* 정보 박스 */}
<InfoBox type="tip | warning | info">
  내용
</InfoBox>

{/* 코드 블록 (app-dev) */}
```tsx
// 코드 내용
```
```

---

## 9. content-plan.md 연동

에이전트는 글 작성 전 `content-plan.md`를 읽어서:
- 이미 계획된 주제가 있으면 그 방향으로 작성
- 없으면 자유롭게 생성 후 content-plan.md에 완료 항목으로 추가

`content-plan.md` 형식:
```markdown
## 예정
- [ ] baseball: 한화 6월 홈경기 시리즈 후기
- [ ] affiliate: 에이블리 여름 세일 추천

## 완료
- [x] 2026-05-31: app-dev - 포도알줍줍 모바일 UI 개선기
```

---

## 10. 에이전트 금지 사항

- `published: true` 상태로 사실 확인 안 된 정보 올리지 말 것
- gov-info 카테고리: 웹 검색 없이 작성 금지
- 제휴 링크 없이 affiliate 카테고리 글 완성 처리 금지
- 이미 존재하는 slug로 새 파일 생성 금지 (덮어쓰기 위험)
  → 생성 전 반드시 `ls content/blog/[category]/` 확인
- git push 전 frontmatter 누락 여부 반드시 검토
