import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "강민정의 서재",
    template: "%s | 강민정의 서재",
  },
  description: "읽은 책, 쓴 글, 그리고 생각들. 강민정의 작은 서재입니다.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "강민정의 서재",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col text-[#111111] bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-8 mt-16">
          <div className="max-w-2xl mx-auto px-6 text-center text-sm text-gray-400">
            © 2026 강민정의 서재
          </div>
        </footer>
      </body>
    </html>
  );
}
