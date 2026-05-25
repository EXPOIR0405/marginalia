"use client";

import { useEffect, useState } from "react";

type Props = {
  title: string;
};

export default function BookAuthor({ title }: Props) {
  const [author, setAuthor] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/book-cover?title=${encodeURIComponent(title)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.author) setAuthor(data.author);
      })
      .catch(() => {});
  }, [title]);

  if (!author) return <p className="text-sm text-gray-300 mb-3">저자 불러오는 중...</p>;

  return <p className="text-sm text-gray-400 mb-3">{author}</p>;
}
