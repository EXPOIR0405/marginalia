"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  isbn?: string;
  title: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { width: 64, height: 92, className: "w-16 h-[92px]" },
  md: { width: 96, height: 138, className: "w-24 h-[138px]" },
  lg: { width: 128, height: 184, className: "w-32 h-[184px]" },
};

// 책 제목에 따라 일관된 배경색 생성
function getTitleColor(title: string): string {
  const colors = [
    "bg-stone-200",
    "bg-slate-200",
    "bg-zinc-200",
    "bg-neutral-200",
    "bg-gray-200",
  ];
  const index = title.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function BookCover({ isbn, title, size = "md" }: Props) {
  const [imgError, setImgError] = useState(false);
  const { width, height, className } = sizes[size];
  const coverUrl = isbn
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
    : null;

  if (coverUrl && !imgError) {
    return (
      <div className={`${className} relative flex-shrink-0 rounded overflow-hidden shadow-sm`}>
        <Image
          src={coverUrl}
          alt={`${title} 표지`}
          width={width}
          height={height}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 표지 없을 때 플레이스홀더
  const initials = title.slice(0, 2);
  return (
    <div
      className={`${className} ${getTitleColor(title)} flex-shrink-0 rounded shadow-sm flex items-center justify-center`}
    >
      <span className="text-gray-500 text-xs font-medium text-center leading-tight px-1">
        {initials}
      </span>
    </div>
  );
}
