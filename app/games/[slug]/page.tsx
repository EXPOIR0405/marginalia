import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllGames, getGame } from "@/lib/mdx";
import MdxContent from "@/components/MdxContent";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllGames().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: game.title,
    robots: { index: false },
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(rating)}
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/games"
        className="text-xs text-gray-400 hover:text-gray-700 transition-colors mb-8 inline-block"
      >
        ← 개암 리뷰로
      </Link>

      <header className="mb-10">
        <p className="text-xs text-gray-300 mb-3 tracking-widest uppercase">🎮 Game Review</p>

        {/* 썸네일 이미지 */}
        {game.image && (
          <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 mb-6">
            <Image
              src={game.image}
              alt={game.title}
              width={672}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight leading-snug mb-3">
          {game.title}
        </h1>
        <div className="flex items-center gap-3 mb-2">
          <StarRating rating={game.rating} />
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {game.platform}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {game.genre}
          </span>
        </div>
        <p className="text-xs text-gray-400">{formatDate(game.date)}</p>
      </header>

      <article>
        <MdxContent source={game.content} />
      </article>
    </div>
  );
}
