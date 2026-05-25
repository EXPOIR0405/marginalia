import Link from "next/link";
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
    <Link href={`/writings/${writing.slug}`} className="group block py-5 border-b border-gray-100 hover:border-gray-200 transition-colors">
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
    </Link>
  );
}
