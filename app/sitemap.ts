import { MetadataRoute } from "next";
import { getAllBooks, getAllWritings, getAllGames } from "@/lib/mdx";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kangminjeong-library.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const books = getAllBooks();
  const writings = getAllWritings();
  const games = getAllGames();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/books`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/writings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/games`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const bookPages: MetadataRoute.Sitemap = books.map((b) => ({
    url: `${BASE_URL}/books/${encodeURIComponent(b.slug)}`,
    lastModified: new Date(b.readDate),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const writingPages: MetadataRoute.Sitemap = writings.map((w) => ({
    url: `${BASE_URL}/writings/${encodeURIComponent(w.slug)}`,
    lastModified: new Date(w.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const gamePages: MetadataRoute.Sitemap = games.map((g) => ({
    url: `${BASE_URL}/games/${encodeURIComponent(g.slug)}`,
    lastModified: new Date(g.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...bookPages, ...writingPages, ...gamePages];
}
