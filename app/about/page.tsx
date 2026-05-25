import type { Metadata } from "next";
import Image from "next/image";
import { getAllBooks, getAllTags } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "주인장",
  description: "강민정에 대하여",
};

export default function AboutPage() {
  const books = getAllBooks();
  const tags = getAllTags();

  // 태그별 빈도 계산
  const tagCount: Record<string, number> = {};
  books.forEach((b) => b.tags.forEach((t) => {
    tagCount[t] = (tagCount[t] || 0) + 1;
  }));
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs text-gray-400 mb-2 tracking-widest uppercase">About</p>
        <h1 className="text-xl font-bold tracking-tight">주인장</h1>
      </div>

      {/* 자기소개 */}
      <section className="mb-12">
        <div className="flex items-center gap-5 mb-6">
          <Image
            src="/notion_img.png"
            alt="강민정"
            width={72}
            height={72}
            className="rounded-full object-cover w-[72px] h-[72px]"
          />
          <p className="text-[15px] leading-relaxed text-gray-700">
            안녕하세요, 강민정입니다.
          </p>
        </div>
        <p className="text-[15px] leading-relaxed text-gray-600 mb-4">
          기획자로 일하고 있습니다. 좋은 서비스는 본질적인 문제를 정확히 정의하는 것에서 시작한다고 믿으며,
          사람들이 의미 있는 일에 집중할 수 있는 환경을 만드는 것에 관심이 많습니다.
        </p>
        <p className="text-[15px] leading-relaxed text-gray-600">
          이 서재는 제가 읽은 책과 쓴 글을 모아두는 공간입니다.
          책 한 권이 남긴 밑줄과 질문들, 그리고 그 사이에서 생겨난 생각들을 이곳에 기록합니다.
          단순한 독후감이 아니라, 책이 나의 일과 삶에 어떻게 닿아 있는지를 함께 담으려 합니다.
        </p>
      </section>

      {/* 독서 통계 */}
      <section className="bg-gray-50 rounded-xl p-6 mb-12">
        <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-5">
          Reading Stats
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight">{books.length}</p>
            <p className="text-xs text-gray-400 mt-1">읽은 책</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight">{tags.length}</p>
            <p className="text-xs text-gray-400 mt-1">장르/태그</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight">
              {books.filter((b) => b.recommend).length}
            </p>
            <p className="text-xs text-gray-400 mt-1">추천 도서</p>
          </div>
        </div>
        {topTags.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">자주 읽는 분야</p>
            <div className="flex gap-2">
              {topTags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 연락 */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Contact
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          책 추천이나 이야기를 나누고 싶다면 편하게 연락 주세요.
        </p>
        <a
          href="mailto:rkdalswjd0405@gmail.com"
          className="inline-block mt-3 text-sm text-gray-900 border-b border-gray-300 hover:border-gray-900 transition-colors pb-0.5"
        >
          rkdalswjd0405@gmail.com
        </a>
      </section>
    </div>
  );
}
