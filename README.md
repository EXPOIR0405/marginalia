# 여백에 적힌 글(marginalia)

읽은 책, 쓴 글, 그리고 그 사이에서 피어난 생각들을 모아두는 개인 아카이브입니다. 

## 소개

책 한 권을 읽고 나면 노트를 남깁니다. 그 노트에서 뻗어나온 짧은 에세이를 씁니다. 책과 무관하게 정리하고 싶은 생각이 생기면 연재글로 올립니다. 이 사이트는 그 모든 것을 한 곳에 모아두기 위해 만들었습니다. 생각에 대해 교류하고 싶으시다면 언제든지 이메일로 연락주세요 :) 

## 주요 기능

- **서재** — 읽은 책 목록 / 태그 필터 / ISBN 기반 책 표지 자동 로딩
- **책 상세** — 독서 노트 탭 + 에세이 탭 / 같은 태그의 책 추천
- **연재** — 책과 무관한 독립 글 목록
- **주인장** — 소개 및 독서 통계 자동 계산

## 콘텐츠 구조

DB 없이 MDX 파일로만 관리합니다. 새 파일을 추가하고 push하면 자동으로 사이트에 반영됩니다.

```
content/
├── books/
│   └── 책-제목/
│       ├── index.mdx   # 독서 노트
│       └── essay.mdx   # 에세이 (선택)
└── writings/
    └── 글-제목.mdx     # 독립 연재글
```

### 책 노트 frontmatter

```yaml
---
title: "책 제목"
author: "저자"
readDate: "2026-05-25"
isbn: "9780000000000"      # Open Library 표지 자동 로딩
tags: ["태그1", "태그2"]
rating: 4                   # 1~5
oneLineSummary: "한 줄 요약"
recommend: true
hasEssay: true              # essay.mdx 있으면 true
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

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 폰트 | Pretendard |
| 콘텐츠 | MDX + gray-matter |
| 배포 | Vercel |

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```
