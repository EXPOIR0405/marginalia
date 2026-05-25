"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type Props = {
  isbn?: string;
  title: string;
  author?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { width: 64, height: 92, className: "w-16 h-[92px]" },
  md: { width: 96, height: 138, className: "w-24 h-[138px]" },
  lg: { width: 128, height: 184, className: "w-32 h-[184px]" },
};

function getTitleColor(title: string): string {
  const colors = [
    "bg-stone-200",
    "bg-slate-200",
    "bg-zinc-200",
    "bg-neutral-200",
    "bg-gray-200",
  ];
  return colors[title.charCodeAt(0) % colors.length];
}

export default function BookCover({ isbn, title, author, size = "md" }: Props) {
  const { width, height, className } = sizes[size];

  const openLibraryUrl = isbn
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
    : null;

  const [imgUrl, setImgUrl] = useState<string | null>(openLibraryUrl);
  const [failed, setFailed] = useState(false);

  // Open Library 실패하거나 ISBN 없으면 → Naver API로 fallback
  useEffect(() => {
    if (imgUrl && !failed) return;

    const params = new URLSearchParams({ title });
    if (author) params.set("author", author);

    fetch(`/api/book-cover?${params}`)
      .then((r) => r.json())
      .then(({ imageUrl }) => {
        if (imageUrl) {
          setImgUrl(imageUrl);
          setFailed(false);
        }
      })
      .catch(() => {});
  }, [failed, title, author]); // eslint-disable-line react-hooks/exhaustive-deps

  if (imgUrl && !failed) {
    return (
      <div className={`${className} relative shrink-0 rounded overflow-hidden shadow-sm`}>
        <Image
          src={imgUrl}
          alt={`${title} 표지`}
          width={width}
          height={height}
          className="object-cover w-full h-full"
          onError={() => {
            setFailed(true);
            setImgUrl(null);
          }}
          unoptimized // 외부 동적 URL (Naver CDN)
        />
      </div>
    );
  }

  // 모든 시도 실패 시 플레이스홀더
  return (
    <div
      className={`${className} ${getTitleColor(title)} shrink-0 rounded shadow-sm flex items-center justify-center`}
    >
      <span className="text-gray-500 text-xs font-medium text-center leading-tight px-1">
        {title.slice(0, 2)}
      </span>
    </div>
  );
}
