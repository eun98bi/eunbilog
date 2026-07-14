# CLAUDE.md — eunbilog.com 블로그 자동화 지시서

> 이 파일은 Claude Code 에이전트가 eunbilog.com 블로그를 운영하는 데 필요한
> 모든 규칙, 구조, 작업 흐름을 정의한다.
> 새 대화를 시작할 때마다 이 파일을 먼저 읽고 시작할 것.

---

## 1. 프로젝트 개요

- **사이트**: eunbilog.com
- **GitHub**: https://github.com/eun98bi/eunbilog.git
- **구조**: 허브형 — 랜딩(`/`) + 블로그(`/blog`) + 관리자(`/admin`)
- **스택**: Next.js 14 (App Router), Supabase (Postgres + Auth), Tailwind CSS, Vercel
- **콘텐츠 저장**: Supabase `posts` 테이블 (본문은 순수 Markdown 문자열)
- **콘텐츠 게시**: DB에 insert/upsert하는 즉시 반영 (ISR `revalidate = 60`). 코드 변경만
  git push → Vercel 재배포 대상이고, 글 자체는 git과 무관하다.

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
│   │   │       └── page.tsx      # 개별 포스트 (Markdown 렌더링)
│   └── admin/                    # 관리자 대시보드 (로그인 필요)
│       ├── login/page.tsx        # 로그인
│       ├── page.tsx              # 전체 글 목록 (초안 포함)
│       ├── posts/new/page.tsx    # 새 글 작성
│       ├── posts/[id]/edit/page.tsx  # 글 수정/삭제
│       ├── bulk/page.tsx         # JSON 대량 업로드
│       └── actions.ts            # 'use server' CRUD 액션
├── lib/
│   ├── posts.ts                  # Supabase에서 posts 테이블 조회
│   └── supabase/
│       ├── server.ts             # 서버 컴포넌트/액션용 클라이언트 (세션 인지)
│       └── client.ts             # 브라우저용 클라이언트 (로그인 폼)
├── components/
│   └── blog/
│       ├── PostCard.tsx
│       ├── CategoryBadge.tsx
│       ├── AffiliateBlock.tsx    # 제휴 링크 버튼 (상세 페이지가 자동 렌더링)
│       └── ToolToolzBanner.tsx   # ToolToolz 배너 (category === 'tooltoolz'일 때 자동 렌더링)
├── scripts/
│   └── post.mjs                  # Claude Code가 글을 DB에 직접 upsert하는 CLI
├── supabase/
│   └── schema.sql                # posts 테이블 + RLS 정의 (Supabase SQL Editor에서 실행)
├── middleware.ts                 # /admin 세션 보호
├── CLAUDE.md                     # 이 파일
└── content-plan.md               # 콘텐츠 계획 (에이전트가 참조)
```

---

## 3. 게시글 데이터 스펙 (JSON)

모든 포스트는 `scripts/post.mjs`에 넘기는 JSON 파일(단일 객체 또는 배열) 또는 `/admin/bulk`
텍스트영역에 아래 형태로 작성한다. 이 JSON이 그대로 Supabase `posts` 테이블 행이 된다.

```jsonc
{
  "title": "제목 (60자 이내, SEO 최적화)",
  "slug": "url-friendly-slug-in-korean-or-english",
  "date": "YYYY-MM-DD",
  "category": "app-dev | baseball | tooltoolz | affiliate | gov-info | side-hustle | ai-news | travel",
  "tags": ["태그1", "태그2", "태그3"],
  "excerpt": "검색결과·카드에 노출되는 요약 (150자 이내)",
  "coverImage": "https://... 또는 null",
  "published": true,
  "content": "# 마크다운 본문...",
  "affiliate": {
    "platform": "myrealtrip | coupang | ably | null",
    "links": [
      { "text": "링크 텍스트", "url": "https://...", "code": "제휴코드(선택)" }
    ]
  },
  "seo": {
    "metaTitle": "메타 제목 (없으면 title 사용)",
    "metaDescription": "메타 설명 (없으면 excerpt 사용)",
    "keywords": ["키워드1", "키워드2"]
  }
}
```

`affiliate`, `seo`, `coverImage`는 없으면 생략 가능 (null 처리됨). 동일한
`(category, slug)` 조합으로 다시 업로드하면 기존 행을 덮어쓴다(upsert).

### 카테고리별 필수 규칙

| 카테고리 | affiliate 값 | 특이사항 |
|---|---|---|
| `app-dev` | null | 개발 과정 솔직하게, 실패도 기록 |
| `baseball` | null | KBO 경기 결과 포함 시 날짜 명시 |
| `tooltoolz` | null | 반드시 tooltoolz.com 링크 포함 |
| `affiliate` | platform 명시 (coupang \| ably) | 제휴 링크 필수, 상단 disclosure 포함. 마이리얼트립은 travel 카테고리로 |
| `gov-info` | null | 정확한 출처·날짜 명시 필수 |
| `side-hustle` | null | 실제 수익/결과 수치 포함 권장 |
| `ai-news` | null | 최신 AI 뉴스·모델·서비스 정보. 웹 검색 필수. 출처 링크 포함 |
| `travel` | myrealtrip | 여행 정보 + 마이리얼트립 제휴 링크. disclosure 포함 필수 |

---

## 4. 에이전트 작업 흐름

### 4-1. 글 작성 요청 시 에이전트 동작 순서

```
1. [Web Search] 주제 관련 최신 정보 검색 (필요 시)
2. [Read] content-plan.md 확인 → 예정 포스트 있는지 체크
3. [Write] 스크래치 경로에 post.json 작성 (섹션 3 스펙 준수)
4. [Read] 작성한 JSON 재검토 (필수 필드 누락 없는지 확인)
5. [Bash] node scripts/post.mjs <post.json> 실행 → Supabase에 즉시 upsert
6. 완료 보고: 카테고리/슬러그 + 게시 여부(published) 출력
   (게시된 글은 최대 60초 이내 https://www.eunbilog.com/blog/[category]/[slug] 에 반영)
```

파일을 저장소에 커밋할 필요가 없다 — `scripts/post.mjs`가 DB에 직접 반영하므로 git과
무관하게 즉시 게시된다. git push는 코드(컴포넌트, 스타일 등) 변경이 있을 때만 한다.

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
"affiliate 글 써줘"     → 계절·트렌드 기반 쿠팡·에이블리 제휴 주제 자동 선정
"gov-info 글 써줘"      → 최근 자주 검색되는 행정 정보 주제 선정
"app-dev 글 써줘"       → content-plan.md 예정 항목 또는 최근 작업 기반
"side-hustle 글 써줘"   → 현재 운영 중인 프로젝트 기반 주제 선정
"ai-news 글 써줘"       → 최근 AI 뉴스·모델·서비스 중 주목할 주제 자동 선정
"travel 글 써줘"        → 계절 여행지·항공권·숙소 마이리얼트립 제휴 주제 자동 선정

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
- **웹 검색 여부**: `gov-info`, `affiliate`, `travel`, `ai-news` 카테고리는 항상 검색 후 작성
  - `baseball`은 당일 경기 글이면 검색, 그 외는 생략
  - `app-dev`, `side-hustle`은 검색 생략 (경험 기반 글)

### 4-4. 주제 자동 탐색 모드 (카테고리만 지정 시)

카테고리만 주어지고 주제가 없으면 에이전트는 아래 순서로 주제를 스스로 찾는다.

#### 탐색 순서

```
1. [Read] content-plan.md → 예정된 미작성 항목 있으면 그것을 첫 번째 후보로
2. `/admin` 대시보드 또는 Supabase `posts` 테이블에서 해당 카테고리 기존 글 목록 확인 (중복 방지)
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
| `affiliate` | 계절·시즌·트렌드 기반 (쿠팡·에이블리) | `"요즘 인기 쿠팡 제품"`, `"에이블리 신상 [현재 월]"` |
| `gov-info` | 최근 정책 변경·신청 기간 임박 항목 | `"[현재 월] 정부 지원금 신청"`, `"최근 행정 서비스 변경"` |
| `app-dev` | content-plan.md 우선, 없으면 최근 커밋 기반 | `git log --oneline -5` 실행 후 최근 작업 주제 파악 |
| `tooltoolz` | tooltoolz.com 기능 중 아직 소개 안 한 도구 | 기존 포스트 목록 확인 후 미소개 도구 선정 |
| `side-hustle` | 현재 운영 프로젝트 중 공유할 내용 | content-plan.md + 최근 개발 로그 기반 |
| `ai-news` | 최근 1주일 내 주요 AI 뉴스·릴리즈 | `"AI 뉴스 [날짜]"`, `"최신 AI 모델 출시"`, `"인공지능 서비스 업데이트"` |
| `travel` | 계절·여행 시즌 기반 마이리얼트립 연관 목적지 | `"[현재 월] 여행 추천"`, `"마이리얼트립 [여행지] 항공권"`, `"[여행지] 여행 코스"` |

#### 주제 선정 기준 (우선순위 순)

1. **시의성** — 오늘 날짜와 연관된 주제 (경기, 마감, 시즌)
2. **계획된 항목** — content-plan.md 예정 목록
3. **검색 수요** — 검색량 높을 것으로 예상되는 주제
4. **중복 없음** — 기존 포스트와 주제 겹치지 않을 것

#### affiliate 카테고리 특별 규칙

`affiliate` 카테고리는 **쿠팡·에이블리** 전용이다. 마이리얼트립 제휴 콘텐츠는 반드시 `travel` 카테고리를 사용한다.

주제 자동 탐색 시 플랫폼 선정 기준:

```
affiliate (쿠팡·에이블리):
- 6~8월: 에이블리 (여름 패션)
- 9~11월: 쿠팡 (추석 선물·가을 용품)
- 12~2월: 쿠팡 (연말·설날) + 에이블리 (겨울 패션)
- 3~5월: 에이블리 (봄 패션) + 쿠팡 (봄 생활용품)

travel (마이리얼트립):
- 3~5월: 봄 여행 시즌 (일본·동남아·제주)
- 6~8월: 여름 휴가 (동남아·유럽·국내 워터파크 근처)
- 9~11월: 단풍·가을 여행 (일본·국내)
- 12~2월: 연말·겨울 여행 (동남아·해외 도시 여행)
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
본문 중간에 마크다운 링크로 tooltoolz.com을 최소 1회 언급 (`category: "tooltoolz"`이면
기사 하단에 배너가 자동으로 추가되어 총 2회 이상 노출된다).

**affiliate**: 상단에 반드시 disclosure 삽입:
```markdown
> 💡 이 포스트에는 제휴 링크가 포함되어 있어요.
> 링크를 통해 구매하시면 저에게 소정의 수수료가 지급됩니다.
```
경험담처럼 써야 함. 광고 느낌 X.

**gov-info**: 정보 정확성 최우선. 출처 링크 필수. 날짜 명시.
"~카더라" 표현 절대 금지. 마지막에 "변경될 수 있으니 공식 사이트 확인" 문구.

**side-hustle**: 구체적인 수치 포함 권장 (수익, 시간, 비용).
"나도 할 수 있다"는 느낌보다 "이렇게 해봤다"는 기록 느낌.

**ai-news**: 뉴스 요약 + 개인 의견 한 줄 포함. 출처 링크 필수.
너무 기술적이지 않게, 일반 독자도 읽을 수 있는 수준으로.

**travel**: 여행 경험담처럼 써야 함. 가격·예약 팁 포함 권장.
상단에 반드시 disclosure 삽입:
```markdown
> 💡 이 포스트에는 마이리얼트립 제휴 링크가 포함되어 있어요.
> 링크를 통해 예약하시면 저에게 소정의 수수료가 지급됩니다.
```
본문 중간에는 일반 마크다운 링크(`[텍스트](url)`)로 마이리얼트립 링크를 최소 1회 삽입.
`affiliate.links`에 채워두면 기사 하단에 버튼이 자동으로 추가되므로 총 2회 이상 노출된다.

---

## 6. SEO 체크리스트

에이전트가 파일 생성 전 자동으로 확인:

- [ ] title 60자 이내
- [ ] excerpt 150자 이내
- [ ] 본문에 메인 키워드 자연스럽게 3회 이상 등장
- [ ] h2 소제목 최소 2개
- [ ] 내부 링크 최소 1개 (다른 포스트 또는 eunbilog.com 페이지)
- [ ] affiliate 카테고리: 제휴 링크 disclosure 포함
- [ ] travel 카테고리: 마이리얼트립 disclosure + 링크 2회 이상 포함
- [ ] tooltoolz 카테고리: tooltoolz.com 링크 포함
- [ ] ai-news 카테고리: 출처 링크 포함

---

## 7. 게시 명령어 참조

```bash
# 글 1개 게시 (섹션 3 스펙의 JSON 파일)
node scripts/post.mjs path/to/post.json

# 여러 글 한번에 (JSON 배열 파일 하나)
node scripts/post.mjs path/to/posts.json

# 초안으로만 저장 (사이트에 노출 안 함)
# → JSON에서 "published": false 로 작성 후 위와 동일하게 실행
```

이 스크립트는 `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY`로 RLS를 우회해 직접
Supabase `posts` 테이블에 upsert한다. git commit/push는 필요 없다.

코드(컴포넌트, 페이지, 스타일 등)를 변경했을 때만 git으로 커밋하고 push한다:
```bash
git add <변경한 파일>
git commit -m "설명"
git push origin main
```

---

## 8. 본문 작성 시 자동 렌더링되는 요소

본문에 컴포넌트 태그를 직접 넣지 않는다 (순수 Markdown). 아래는 상세 페이지가
구조화된 필드값을 보고 자동으로 붙여주는 것들이다:

- **제휴 버튼**: `affiliate.links`에 항목을 채우면 기사 하단에 버튼으로 자동 렌더링
- **ToolToolz 배너**: `category: "tooltoolz"`이면 기사 하단에 자동 렌더링
- **콜아웃 박스**: 본문에서 blockquote(`> ...`)로 쓰면 자동으로 스타일 박스로 렌더링됨
  (disclosure 문구도 이 방식 그대로 사용)
- **코드 블록**: 일반 마크다운 코드펜스(`` ``` ``) 그대로 사용 가능 (app-dev 등)

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
- ai-news 카테고리: 웹 검색 없이 작성 금지, 출처 없는 정보 게시 금지
- 제휴 링크 없이 affiliate 또는 travel 카테고리 글 완성 처리 금지
- travel 카테고리에 마이리얼트립 외 제휴 플랫폼(쿠팡·에이블리) 링크 넣지 말 것
- affiliate 카테고리에 마이리얼트립 링크 넣지 말 것 (travel 카테고리 사용)
- 이미 존재하는 `(category, slug)` 조합으로 upsert하면 기존 글을 덮어쓴다 —
  의도한 수정이 아니라면 slug를 다르게 지정할 것 (→ `/admin` 대시보드에서 기존 글 확인)
- `node scripts/post.mjs` 실행 전 JSON의 필수 필드 누락 여부 반드시 검토
