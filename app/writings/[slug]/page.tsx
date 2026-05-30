import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllWritings, getWriting, getSeriesNavigation, getReadingTime } from "@/lib/mdx";
import MdxContent from "@/components/MdxContent";
import ShareButton from "@/components/ShareButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllWritings().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const writing = getWriting(slug);
  if (!writing) return {};
  return {
    title: writing.title,
    description: writing.excerpt,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function WritingDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const writing = getWriting(slug);
  if (!writing) notFound();

  const { prev, next } = getSeriesNavigation(slug);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* 뒤로가기 + 공유 */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/writings"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← 연재로
        </Link>
        <ShareButton />
      </div>

      {/* 글 헤더 */}
      <header className="mb-10">
        {writing.series && (
          <p className="text-xs text-indigo-400 font-medium mb-2">
            {writing.series}
            {writing.episode !== undefined && ` — EP.${writing.episode}`}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
          {writing.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight leading-snug mb-3">
          {writing.title}
        </h1>
        <p className="text-xs flex flex-wrap items-center gap-x-2">
          <span className="text-gray-400">{formatDate(writing.date)}</span>
          <span className="text-gray-200">·</span>
          <span className="text-gray-500">약 {getReadingTime(writing.content)}분</span>
        </p>
      </header>

      {/* 썸네일 */}
      {writing.image && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-10">
          <Image
            src={writing.image}
            alt={writing.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 본문 */}
      <article>
        <MdxContent source={writing.content} />
      </article>

      {/* 시리즈 이전 / 다음 네비게이션 */}
      {(prev || next) && (
        <nav className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex-1">
            {prev && (
              <Link
                href={`/writings/${prev.slug}`}
                className="group flex flex-col gap-1 text-left"
              >
                <span className="text-xs text-gray-300 group-hover:text-blue-300 transition-colors">
                  ← 이전 글
                </span>
                <span className="text-sm font-medium text-gray-500 group-hover:text-blue-300 transition-colors line-clamp-1">
                  {prev.title.replace(/.*— /, "")}
                </span>
              </Link>
            )}
          </div>

          <div className="flex-1 text-right">
            {next && (
              <Link
                href={`/writings/${next.slug}`}
                className="group flex flex-col gap-1 items-end"
              >
                <span className="text-xs text-gray-300 group-hover:text-blue-300 transition-colors">
                  다음 글 →
                </span>
                <span className="text-sm font-medium text-gray-500 group-hover:text-blue-300 transition-colors line-clamp-1">
                  {next.title.replace(/.*— /, "")}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
