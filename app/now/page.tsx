import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import MdxContent from "@/components/MdxContent";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Now",
  description: "지금 강민정은 무엇을 하고 있는가.",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NowPage() {
  const filePath = path.join(process.cwd(), "content", "now.mdx");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const updatedAt = data.updatedAt as string | undefined;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-xs text-gray-400 hover:text-gray-700 transition-colors mb-8 inline-block"
      >
        ← 홈으로
      </Link>

      <div className="mb-10">
        <p className="text-xs text-gray-400 mb-2 tracking-widest uppercase">Now</p>
        <h1 className="text-xl font-bold tracking-tight mb-1">지금 이 순간</h1>
        {updatedAt && (
          <p className="text-xs text-gray-300">{formatDate(updatedAt)} 기준</p>
        )}
      </div>

      <article>
        <MdxContent source={content} />
      </article>

      <p className="mt-16 text-xs text-gray-300 border-t border-gray-100 pt-6">
        이 페이지는{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-gray-500 transition-colors"
        >
          /now 페이지 운동
        </a>
        에서 영감을 받았어요.
      </p>
    </div>
  );
}
