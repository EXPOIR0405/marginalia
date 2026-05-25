# 강민정의 서재

읽은 책, 쓴 글, 그리고 그 사이에서 피어난 생각들을 모아두는 개인 아카이브입니다.

책 한 권을 읽고 나면 노트를 남깁니다. 그 노트에서 뻗어나온 짧은 에세이를 씁니다. 책과 무관하게 정리하고 싶은 생각이 생기면 연재글로 올립니다. 생각에 대해 교류하고 싶으시다면 언제든지 이메일로 연락주세요 :)

---

## 페이지 구조

### `/` 홈
- 사이트 소개 한 줄
- 최근 읽은 책 3권 미리보기 (`BookCard`)
- 최근 연재글 3편 미리보기 (`WritingCard`)
- 각 섹션에서 전체 보기 링크 제공

### `/books` 서재
- 읽은 책 전체 목록 (`BookCard` 리스트)
- 태그 필터 — URL 파라미터 기반 (`/books?tag=자기계발`)
- 책 총 권수 표시

### `/books/[slug]` 책 상세
- 책 표지 이미지 (Naver 책 API 자동 로딩, 실패 시 플레이스홀더)
- 별점 / 저자 / 한 줄 요약 / 태그 / 독서일
- **탭 구조**
  - 📖 노트 탭 — `index.mdx` 본문 렌더링
  - ✍️ 에세이 탭 — `essay.mdx` 본문 렌더링 (`hasEssay: true`일 때만 표시)
- 같은 태그의 책 추천 섹션 (최대 3권)

### `/writings` 연재
- 독립 연재글 전체 목록 (`WritingCard` 리스트)
- 글 없을 때 빈 상태 메시지 표시

### `/writings/[slug]` 연재글 상세
- 태그 / 제목 / 날짜 헤더
- MDX 본문 렌더링

### `/about` 주인장
- 동그란 프로필 사진 + 자기소개
- 독서 통계 자동 계산 (읽은 책 수 / 태그 수 / 추천 도서 수 / 자주 읽는 분야 Top 3)
- 이메일 연락처

---

## 콘텐츠 관리

DB 없이 MDX 파일로만 관리합니다. 파일을 추가하고 GitHub에 push하면 Vercel이 자동으로 배포합니다.

```
content/
├── books/
│   └── 책-슬러그/
│       ├── index.mdx   # 독서 노트 (필수)
│       └── essay.mdx   # 에세이 (선택)
└── writings/
    └── 글-슬러그.mdx   # 독립 연재글
```

### 책 노트 frontmatter

```yaml
---
title: "책 제목"
author: "저자"
readDate: "2026-05-25"
tags: ["태그1", "태그2"]
rating: 5                         # 1~5
oneLineSummary: "한 줄 요약"
recommend: true
hasEssay: true                    # essay.mdx 있으면 true
---
```

### 연재글 frontmatter

```yaml
---
title: "글 제목"
date: "2026-05-25"
tags: ["태그"]
excerpt: "한 줄 소개"
---
```

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 폰트 | Pretendard |
| 콘텐츠 | MDX + gray-matter + remark-gfm |
| 책 표지 | Naver 책 API (제목+저자 자동 검색) |
| 통계 | Vercel Analytics |
| 배포 | Vercel |

## 컴포넌트 구조

```
components/
├── Header.tsx        # 상단 네비게이션 (서재 / 연재 / 주인장)
├── BookCard.tsx      # 책 목록 카드 (표지 + 제목 + 별점 + 태그)
├── BookCover.tsx     # 책 표지 이미지 (Naver API → 플레이스홀더 순으로 fallback)
├── WritingCard.tsx   # 연재글 목록 카드 (제목 + 날짜 + 태그)
└── MdxContent.tsx    # MDX 본문 렌더러 (remark-gfm으로 표 지원)
```

## 로컬 실행

```bash
# 환경변수 설정 (.env.local)
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

npm install
npm run dev
# http://localhost:3000
```
