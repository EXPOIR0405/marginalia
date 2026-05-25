import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllGames } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "이달의 게임 리뷰",
  robots: { index: false }, // 검색엔진에는 노출 안 함 (이스터에그니까)
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-xs">
      {"★".repeat(rating)}
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
}

export default function GamesPage() {
  const games = getAllGames();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs text-gray-300 mb-2 tracking-widest uppercase">🎮 Secret Room</p>
        <h1 className="text-xl font-bold tracking-tight mb-1">이달의 게임 리뷰</h1>
        <p className="text-sm text-gray-400">
          주인장의 소소한 게임 후기 모음. 여기까지 찾아오셨군요 👀
          기왕오셨으니 아래 게임 후기들을 편하게 둘러봐 주세요 :)
        </p>
      </div>

      {games.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-3xl mb-4">🎮</p>
          <p className="text-sm text-gray-400">아직 리뷰가 없습니다.</p>
          <p className="text-xs text-gray-300 mt-1">첫 번째 개암 리뷰를 기다려주세요!</p>
        </div>
      ) : (
        <div>
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group flex gap-4 py-5 border-b border-gray-100 hover:border-gray-200 transition-colors"
            >
              {/* 썸네일 */}
              {game.image && (
                <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={game.image}
                    alt={game.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                </div>
              )}

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h2 className="font-semibold text-[15px] group-hover:opacity-70 transition-opacity">
                    {game.title}
                  </h2>
                  <StarRating rating={game.rating} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {game.platform}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {game.genre}
                  </span>
                  <span className="text-xs text-gray-300">{formatDate(game.date)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {game.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
