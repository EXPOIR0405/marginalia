import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllBooks, getBook, getRelatedBooks } from "@/lib/mdx";
import BookCover from "@/components/BookCover";
import BookAuthor from "@/components/BookAuthor";
import BookCard from "@/components/BookCard";
import MdxContent from "@/components/MdxContent";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateStaticParams() {
  return getAllBooks().map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const book = getBook(slug);
  if (!book) return {};
  return {
    title: book.title,
    description: book.oneLineSummary,
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm text-amber-400">
      {"★".repeat(rating)}
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BookDetailPage({ params, searchParams }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { tab } = await searchParams;
  const book = getBook(slug);
  if (!book) notFound();

  const activeTab = tab === "essay" && book.hasEssay ? "essay" : "note";
  const relatedBooks = getRelatedBooks(slug, book.tags);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/books"
        className="text-xs text-gray-400 hover:text-gray-700 transition-colors mb-8 inline-block"
      >
        ← 서재로
      </Link>

      {/* 책 헤더 */}
      <div className="flex gap-6 mb-10">
        <BookCover isbn={book.isbn} title={book.title} author={book.author} size="lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight leading-snug mb-1">
            {book.title}
          </h1>
          {book.author
            ? <p className="text-sm text-gray-400 mb-3">{book.author}</p>
            : <BookAuthor title={book.title} />
          }
          <StarRating rating={book.rating} />
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {book.oneLineSummary}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {book.tags.map((tag) => (
              <Link
                key={tag}
                href={`/books?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-3">{formatDate(book.readDate)} 읽음</p>
        </div>
      </div>

      {/* 탭 */}
      {book.hasEssay && (
        <div className="flex border-b border-gray-100 mb-8">
          <Link
            href={`/books/${slug}`}
            className={`text-sm pb-3 mr-6 border-b-2 transition-colors ${
              activeTab === "note"
                ? "border-gray-900 text-gray-900 font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            📖 노트
          </Link>
          <Link
            href={`/books/${slug}?tab=essay`}
            className={`text-sm pb-3 border-b-2 transition-colors ${
              activeTab === "essay"
                ? "border-gray-900 text-gray-900 font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            ✍️ 에세이
          </Link>
        </div>
      )}

      {/* 콘텐츠 */}
      <article>
        {activeTab === "note" && <MdxContent source={book.content} />}
        {activeTab === "essay" && book.essayContent && (
          <MdxContent source={book.essayContent} />
        )}
      </article>

      {/* 추천 책 */}
      {relatedBooks.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
            이런 책도 읽었어요
          </h2>
          {relatedBooks.map((b) => (
            <BookCard key={b.slug} book={b} />
          ))}
        </section>
      )}
    </div>
  );
}
