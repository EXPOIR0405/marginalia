import Link from "next/link";
import BookCover from "./BookCover";
import type { BookMeta } from "@/lib/mdx";

type Props = {
  book: BookMeta;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-xs text-gray-400">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function BookCard({ book }: Props) {
  return (
    <Link href={`/books/${book.slug}`} className="group flex gap-4 py-5 border-b border-gray-100 hover:border-gray-200 transition-colors">
      <BookCover isbn={book.isbn} title={book.title} author={book.author} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-semibold text-[15px] leading-snug group-hover:opacity-70 transition-opacity line-clamp-1">
            {book.title}
          </h2>
          <StarRating rating={book.rating} />
        </div>
        <p className="text-xs text-gray-400 mb-2">{book.author}</p>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {book.oneLineSummary}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {book.tags.map((tag) => (
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
