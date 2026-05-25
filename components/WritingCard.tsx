import Link from "next/link";
import Image from "next/image";
import type { WritingMeta } from "@/lib/mdx";

type Props = {
  writing: WritingMeta;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default function WritingCard({ writing }: Props) {
  return (
    <Link
      href={`/writings/${writing.slug}`}
      className="group flex gap-4 py-5 border-b border-gray-100 hover:border-gray-200 transition-colors"
    >
      {/* 썸네일 */}
      {writing.image && (
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={writing.image}
            alt={writing.title}
            width={80}
            height={80}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          />
        </div>
      )}

      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        {/* 시리즈 배지 */}
        {writing.series && (
          <p className="text-xs text-indigo-400 font-medium mb-1">
            {writing.series}
            {writing.episode !== undefined && ` — EP.${writing.episode}`}
          </p>
        )}

        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="font-semibold text-[15px] leading-snug group-hover:opacity-70 transition-opacity">
            {writing.title}
          </h2>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5">
            {formatDate(writing.date)}
          </span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">
          {writing.excerpt}
        </p>

        <div className="flex flex-wrap gap-1">
          {writing.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
