# Karla's Library

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)

A personal archive of books I've read, essays I've written, and thoughts in between.

After finishing a book, I write a reading note. From that note grows a short essay. Anything else I want to put into words becomes a serialized piece. Feel free to reach out by email anytime :)

> If you'd like to use this, please **Fork** it rather than just cloning. And if you like it — ⭐ Star is totally up to you!

---

## Pages

### `/` Home
- One-line site intro
- Preview of 3 recently read books (`BookCard`)
- Preview of 3 recent writings (`WritingCard`)
- "View all" links per section

### `/books` Library
- Full list of read books (`BookCard` list)
- Tag filter — URL param based (`/books?tag=self-development`)
- Total book count display

### `/books/[slug]` Book Detail
- Cover image (auto-fetched via Naver Book API, falls back to placeholder)
- Rating / Author / One-line summary / Tags / Read date
- **Tab layout**
  - 📖 Notes tab — renders `index.mdx`
  - ✍️ Essay tab — renders `essay.mdx` (shown only when `hasEssay: true`)
- Related books recommendation (up to 3, same tag)

### `/writings` Writings
- Full list of serialized pieces (`WritingCard` list)
- Empty state message when no posts exist

### `/writings/[slug]` Writing Detail
- Tags / Title / Date header
- MDX body rendering

### `/about` About
- Round profile photo + bio
- Auto-calculated reading stats (books read / tags / recommended books / Top 3 genres)
- Email contact

---

## Admin

Visit `/admin`, log in with a password, and you can write and save content directly via a built-in editor.

- **Save to GitHub** — Commits the written MDX file directly to the repo → auto-deploys via Vercel
- **Image upload** — Uploads to Supabase Storage and inserts the URL
- **AI Polish** — GPT-4o rewrites your draft to a polished level; compare before/after and apply
- **Topic suggestions** — 5 next-episode ideas tailored to your series context
- **Sentence suggestions** (toggle ON/OFF) — After 4 seconds of inactivity, suggests the next sentence

---

## Content Structure

No database — everything is managed as MDX files. Save via admin or push a file to GitHub, and Vercel deploys automatically.

```
content/
├── books/
│   └── book-slug/
│       ├── index.mdx   # Reading notes (required)
│       └── essay.mdx   # Essay (optional)
└── writings/
    └── writing-slug.mdx   # Serialized piece
```

### Book frontmatter

```yaml
---
title: "Book Title"
author: "Author Name"
readDate: "2026-05-25"
tags: ["tag1", "tag2"]
rating: 5                         # 1–5
oneLineSummary: "One-line summary"
recommend: true
hasEssay: true                    # true if essay.mdx exists
---
```

### Writing frontmatter

```yaml
---
title: "Post Title"
date: "2026-05-25"
tags: ["tag"]
excerpt: "One-line intro"
series: "Series Name"      # optional
episode: 4                 # optional, order within series
image: "https://..."       # optional, thumbnail URL
---
```

---

## Tech Stack

| Category | Details |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Font | Pretendard |
| Content | MDX + gray-matter + remark-gfm |
| Book covers | Naver Book API (auto-search by title + author) |
| Image storage | Supabase Storage |
| AI | OpenAI GPT-4o / GPT-4o-mini |
| Content deploy | GitHub API (MDX file commit) |
| Analytics | Vercel Analytics + Umami |
| Hosting | Vercel |

## Component Structure

```
components/
├── Header.tsx        # Top navigation (Library / Writings / About)
├── BookCard.tsx      # Book list card (cover + title + rating + tags)
├── BookCover.tsx     # Cover image (Naver API → placeholder fallback)
├── WritingCard.tsx   # Writing list card (title + date + tags)
└── MdxContent.tsx    # MDX renderer (table support via remark-gfm)
```

---

## Local Setup

```bash
npm install
npm run dev
# http://localhost:3000
```

Create `.env.local` with the following variables:

```
# Book cover images (get from Naver Developers)
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Admin login
ADMIN_PASSWORD=

# GitHub API — Fine-grained PAT (Contents: Read and write)
GITHUB_TOKEN=

# Supabase (for image uploads)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (AI polish · topic suggestions · sentence suggestions)
OPENAI_API_KEY=

# Vercel Deploy Hook (auto-deploy on admin save — optional)
VERCEL_DEPLOY_HOOK_URL=

# Sitemap base URL (optional, default: https://kangminjeong-library.vercel.app)
NEXT_PUBLIC_SITE_URL=
```
