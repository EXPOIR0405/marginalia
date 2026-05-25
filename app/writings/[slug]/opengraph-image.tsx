import { ImageResponse } from "next/og";
import { getWriting } from "@/lib/mdx";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    ).then((r) => r.text());

    const koreanBlock = css.match(/\/\* \[korean\] \*\/[\s\S]*?url\(([^)]+)\)/);
    const url = koreanBlock?.[1];
    if (!url) return null;

    return fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ slug: string }> };

export default async function WritingOGImage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const writing = getWriting(slug);
  if (!writing) return new Response("Not found", { status: 404 });

  const fontData = await loadKoreanFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          backgroundColor: "#ffffff",
          fontFamily: "'Noto Sans KR', sans-serif",
          position: "relative",
        }}
      >
        {/* 좌측 컬러 바 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 6,
            height: "100%",
            backgroundColor: "#111111",
          }}
        />

        {/* 사이트명 */}
        <div
          style={{
            fontSize: 18,
            color: "#9ca3af",
            marginBottom: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Marginalia · 강민정의 서재
        </div>

        {/* 시리즈명 (있을 때만) */}
        {writing.series && (
          <div
            style={{
              fontSize: 20,
              color: "#818cf8",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            {writing.series}
            {writing.episode !== undefined && ` — EP.${writing.episode}`}
          </div>
        )}

        {/* 글 제목 */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: "#111111",
            lineHeight: 1.25,
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          {writing.title.replace(/.*— /, "")}
        </div>

        {/* 한줄 소개 */}
        <div
          style={{
            fontSize: 24,
            color: "#6b7280",
            lineHeight: 1.5,
            maxWidth: 860,
          }}
        >
          {writing.excerpt}
        </div>

        {/* 하단: 태그 */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            display: "flex",
            gap: 8,
          }}
        >
          {writing.tags.slice(0, 3).map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 16px",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                borderRadius: 100,
                fontSize: 18,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              { name: "Noto Sans KR", data: fontData, weight: 400, style: "normal" },
            ],
          }
        : {}),
    }
  );
}
