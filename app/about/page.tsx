import type { Metadata } from "next";
import Image from "next/image";
import { getAllBooks, getAllTags } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "주인장",
  description: "주인장에 대한 소개 페이지입니다.",
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
          일하는 것, 바이브코딩, 스팀 게임 플레이까지 — 뭐든 재미있으면 일단 해보는 편이에요.
          스스로를 둔재라고 생각하는데, 그 말인즉슨 한 번 읽어서는 잘 남지 않는다는 뜻이기도 합니다.
          그래서 이 서재를 만들었어요. 읽고 나서 남긴 한 줄이, 어떤 분께는 작은 인사이트가 됐으면 하는 마음으로요.
        </p>
        <p className="text-[15px] leading-relaxed text-gray-600 mb-4">
          현재 당근서비스에서 PM으로 일하고 있습니다.
          좋은 서비스는 본질적인 문제를 정확히 정의하는 것에서 시작한다고 믿고,
          사람들이 의미 있는 일에 집중할 수 있는 환경을 만드는 데 관심이 많아요.
        </p>
        <p className="text-[15px] leading-relaxed text-gray-600">
          여기까지 오셨다면 아마 주인장이 무슨 생각을 하는지 궁금하신 분이거나,
          어쩌다 흘러들어오신 분일 텐데 — 어느 쪽이든 환영합니다.
          아래 글들을 편하게 둘러봐 주세요 :)
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
