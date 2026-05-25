import type { Metadata } from "next";
import BookCard from "@/components/BookCard";
import { getAllBooks, getAllTags } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "서재",
  description: "강민정이 읽은 책 목록",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const allBooks = getAllBooks();
  const allTags = getAllTags();

  const filtered = tag
    ? allBooks.filter((b) => b.tags.includes(tag))
    : allBooks;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs text-gray-400 mb-2 tracking-widest uppercase">Library</p>
        <h1 className="text-xl font-bold tracking-tight mb-1">서재</h1>
        <p className="text-sm text-gray-400">{allBooks.length}권의 책</p>
      </div>

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/books"
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              !tag
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            전체
          </a>
          {allTags.map((t) => (
            <a
              key={t}
              href={`/books?tag=${encodeURIComponent(t)}`}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                tag === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {t}
            </a>
          ))}
        </div>
      )}

      {/* 책 목록 */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">해당 태그의 책이 없습니다.</p>
      ) : (
        <div>
          {filtered.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
