import Link from "next/link";
import BookCard from "@/components/BookCard";
import WritingCard from "@/components/WritingCard";
import { getAllBooks, getAllWritings } from "@/lib/mdx";

export default function HomePage() {
  const books = getAllBooks().slice(0, 3);
  const allWritings = getAllWritings();

  // 주니어 PM 시리즈 고정 노출
  const featuredSeries = allWritings
    .filter((w) => w.series === "주니어 PM으로 살아남기")
    .sort((a, b) => (b.episode ?? 0) - (a.episode ?? 0))
    .slice(0, 3);

  // 시리즈 글 제외한 최근 연재
  const recentWritings = allWritings
    .filter((w) => w.series !== "주니어 PM으로 살아남기")
    .slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* 인트로 */}
      <section className="mb-16">
        <p className="text-xs text-gray-400 mb-3 tracking-widest uppercase">Marginalia</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">읽고, 쓰고, 만드는 PM</h1>
        <p className="text-gray-500 leading-relaxed text-[15px]">
          책이 남긴 밑줄과 질문들, 그리고 일하며 배운 것들을 이곳에 쌓아요.
        </p>
      </section>

      {/* Featured — 주니어 PM으로 살아남기 */}
      {featuredSeries.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Featured Series
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">주니어 PM으로 살아남기</p>
            </div>
            <Link href="/writings" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div className="mt-3">
            {featuredSeries.map((w) => (
              <WritingCard key={w.slug} writing={w} />
            ))}
          </div>
        </section>
      )}

      {/* 최근 읽은 책 */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Recently Read</h2>
          <Link href="/books" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
            전체 보기 →
          </Link>
        </div>
        {books.length === 0 ? (
          <p className="text-sm text-gray-400 py-8">아직 기록된 책이 없습니다.</p>
        ) : (
          <div>
            {books.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 최근 연재글 (시리즈 제외) */}
      {recentWritings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Recent Writings</h2>
            <Link href="/writings" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div>
            {recentWritings.map((writing) => (
              <WritingCard key={writing.slug} writing={writing} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
