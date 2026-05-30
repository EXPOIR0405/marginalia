import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

// ─── 타입 정의 ────────────────────────────────────────────────

export type BookMeta = {
  slug: string;
  title: string;
  author: string;
  readDate: string;
  isbn?: string;
  tags: string[];
  rating: number;
  oneLineSummary: string;
  recommend: boolean;
  hasEssay: boolean;
};

export type Book = BookMeta & {
  content: string;
  essayContent?: string;
};

export type WritingMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  image?: string;    // 썸네일 이미지 경로 (public/ 기준)
  series?: string;   // 연재 시리즈 이름
  episode?: number;  // 시리즈 내 순서
  draft?: boolean;   // true면 목록에서 숨김
};

export type Writing = WritingMeta & {
  content: string;
};

// ─── 책 ───────────────────────────────────────────────────────

export function getAllBooks(): BookMeta[] {
  const booksDir = path.join(contentDir, "books");
  if (!fs.existsSync(booksDir)) return [];

  const slugs = fs.readdirSync(booksDir).filter((f) => {
    const indexPath = path.join(booksDir, f, "index.mdx");
    return fs.existsSync(indexPath);
  });

  const books = slugs.map((slug) => {
    const filePath = path.join(booksDir, slug, "index.mdx");
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      author: data.author ?? "",
      readDate: data.readDate ?? new Date().toISOString().slice(0, 10),
      isbn: data.isbn,
      tags: data.tags ?? [],
      rating: data.rating ?? 0,
      oneLineSummary: data.oneLineSummary ?? "",
      recommend: data.recommend ?? false,
      hasEssay: data.hasEssay ?? false,
    } satisfies BookMeta;
  });

  return books.sort(
    (a, b) => new Date(b.readDate).getTime() - new Date(a.readDate).getTime()
  );
}

export function getBook(slug: string): Book | null {
  const bookDir = path.join(contentDir, "books", slug);
  const indexPath = path.join(bookDir, "index.mdx");
  if (!fs.existsSync(indexPath)) return null;

  const raw = fs.readFileSync(indexPath, "utf-8");
  const { data, content } = matter(raw);

  let essayContent: string | undefined;
  const essayPath = path.join(bookDir, "essay.mdx");
  if (fs.existsSync(essayPath)) {
    const essayRaw = fs.readFileSync(essayPath, "utf-8");
    const { content: ec } = matter(essayRaw);
    essayContent = ec;
  }

  return {
    slug,
    title: data.title ?? slug,
    author: data.author ?? "",
    readDate: data.readDate ?? new Date().toISOString().slice(0, 10),
    isbn: data.isbn,
    tags: data.tags ?? [],
    rating: data.rating ?? 0,
    oneLineSummary: data.oneLineSummary ?? "",
    recommend: data.recommend ?? false,
    hasEssay: data.hasEssay ?? false,
    content,
    essayContent,
  } satisfies Book;
}

export function getRelatedBooks(currentSlug: string, tags: string[]): BookMeta[] {
  return getAllBooks()
    .filter(
      (b) => b.slug !== currentSlug && b.tags.some((t) => tags.includes(t))
    )
    .slice(0, 3);
}

export function getAllTags(): string[] {
  const books = getAllBooks();
  const tagSet = new Set<string>();
  books.forEach((b) => b.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

// ─── 연재글 ───────────────────────────────────────────────────

export function getAllWritings(): WritingMeta[] {
  const writingsDir = path.join(contentDir, "writings");
  if (!fs.existsSync(writingsDir)) return [];

  const files = fs
    .readdirSync(writingsDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const writings = files
    .map((file) => {
      const slug = file.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(writingsDir, file), "utf-8");
      const { data } = matter(raw);
      return { slug, ...data } as WritingMeta;
    })
    .filter((w) => !w.draft);

  return writings.sort((a, b) => {
    if (a.episode !== undefined && b.episode !== undefined) {
      return a.episode - b.episode;
    }
    if (a.episode !== undefined) return -1;
    if (b.episode !== undefined) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export type SeriesNav = {
  prev: WritingMeta | null;
  next: WritingMeta | null;
};

export function getSeriesNavigation(slug: string): SeriesNav {
  const all = getAllWritings();
  const current = all.find((w) => w.slug === slug);

  if (!current?.series) return { prev: null, next: null };

  const seriesWritings = all
    .filter((w) => w.series === current.series && w.episode !== undefined)
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0));

  const idx = seriesWritings.findIndex((w) => w.slug === slug);

  return {
    prev: idx > 0 ? seriesWritings[idx - 1] : null,
    next: idx < seriesWritings.length - 1 ? seriesWritings[idx + 1] : null,
  };
}

export function getWriting(slug: string): Writing | null {
  const writingsDir = path.join(contentDir, "writings");
  const mdxPath = path.join(writingsDir, `${slug}.mdx`);
  const mdPath = path.join(writingsDir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, ...data, content } as Writing;
}

// ─── 읽기 예상 시간 ───────────────────────────────────────────

/** MDX/Markdown 문법을 걷어낸 뒤 글자 수 기반으로 읽기 시간 계산
 *  한국어 평균 독서 속도: 분당 약 500자
 */
export function getReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, "")   // 코드 블록 제거
    .replace(/`[^`]+`/g, "")          // 인라인 코드 제거
    .replace(/!\[.*?\]\(.*?\)/g, "")  // 이미지 제거
    .replace(/\[.*?\]\(.*?\)/g, "")   // 링크 텍스트만 남기기
    .replace(/#+\s/g, "")             // 헤딩 마커 제거
    .replace(/[*_~>|-]/g, "")         // 마크다운 기호 제거
    .replace(/\s+/g, "");             // 공백 제거 후 순수 글자 수
  return Math.max(1, Math.ceil(stripped.length / 500));
}

// ─── 책 표지 URL ──────────────────────────────────────────────

export function getBookCoverUrl(isbn?: string): string | null {
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

// ─── 게임 리뷰 ────────────────────────────────────────────────

export type GameMeta = {
  slug: string;
  title: string;
  date: string;
  platform: string;   // PC, Switch, PS5 등
  genre: string;
  rating: number;     // 1~5
  excerpt: string;
  recommend: boolean;
  image?: string;     // 썸네일 이미지 경로 (public/ 기준)
};

export type Game = GameMeta & {
  content: string;
};

export function getAllGames(): GameMeta[] {
  const gamesDir = path.join(contentDir, "games");
  if (!fs.existsSync(gamesDir)) return [];

  const files = fs
    .readdirSync(gamesDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const games = files.map((file) => {
    const slug = file.replace(/\.(mdx|md)$/, "");
    const raw = fs.readFileSync(path.join(gamesDir, file), "utf-8");
    const { data } = matter(raw);
    return { slug, ...data } as GameMeta;
  });

  return games.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getGame(slug: string): Game | null {
  const gamesDir = path.join(contentDir, "games");
  const mdxPath = path.join(gamesDir, `${slug}.mdx`);
  const mdPath = path.join(gamesDir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, ...data, content } as Game;
}
