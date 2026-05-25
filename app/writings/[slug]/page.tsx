import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllWritings, getWriting } from "@/lib/mdx";
import MdxContent from "@/components/MdxContent";

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/writings"
        className="text-xs text-gray-400 hover:text-gray-700 transition-colors mb-8 inline-block"
      >
        ← 연재로
      </Link>

      {/* 글 헤더 */}
      <header className="mb-10">
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
        <p className="text-xs text-gray-400">{formatDate(writing.date)}</p>
      </header>

      {/* 본문 */}
      <article>
        <MdxContent source={writing.content} />
      </article>
    </div>
  );
}
