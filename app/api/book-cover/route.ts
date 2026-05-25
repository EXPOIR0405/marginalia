import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const author = searchParams.get("author");

  if (!title) return NextResponse.json({ imageUrl: null });

  const query = author ? `${title} ${author}` : title;

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(query)}&display=1`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
        },
        next: { revalidate: 86400 }, // 24시간 캐시
      }
    );

    if (!res.ok) return NextResponse.json({ imageUrl: null });

    const data = await res.json();
    const item = data.items?.[0] ?? null;
    const imageUrl = item?.image ?? null;
    const author = item?.author ?? null;
    const publisher = item?.publisher ?? null;

    return NextResponse.json({ imageUrl, author, publisher });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
