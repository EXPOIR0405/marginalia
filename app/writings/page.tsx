import type { Metadata } from "next";
import WritingCard from "@/components/WritingCard";
import { getAllWritings } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "연재",
  description: "강민정의 글 목록",
};

export default function WritingsPage() {
  const writings = getAllWritings();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs text-gray-400 mb-2 tracking-widest uppercase">Writings</p>
        <h1 className="text-xl font-bold tracking-tight mb-1">연재</h1>
        <p className="text-sm text-gray-400">
          책과 무관하게 흘러가는 생각들, 그리고 정리하고 싶은 것들.
        </p>
      </div>

      {writings.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400">아직 연재된 글이 없습니다.</p>
          <p className="text-xs text-gray-300 mt-1">곧 첫 번째 글이 올라올 예정입니다.</p>
        </div>
      ) : (
        <div>
          {writings.map((writing) => (
            <WritingCard key={writing.slug} writing={writing} />
          ))}
        </div>
      )}
    </div>
  );
}
