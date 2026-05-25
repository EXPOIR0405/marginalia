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
    return { slug, ...data } as BookMeta;
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

  return { slug, ...data, content, essayContent } as Book;
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

  const writings = files.map((file) => {
    const slug = file.replace(/\.(mdx|md)$/, "");
    const raw = fs.readFileSync(path.join(writingsDir, file), "utf-8");
    const { data } = matter(raw);
    return { slug, ...data } as WritingMeta;
  });

  return writings.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
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

// ─── 책 표지 URL ──────────────────────────────────────────────

export function getBookCoverUrl(isbn?: string): string | null {
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}
