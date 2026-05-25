"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/books", label: "서재" },
  { href: "/writings", label: "연재" },
  { href: "/about", label: "주인장" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-[15px] tracking-tight hover:opacity-70 transition-opacity"
        >
          강민정의 서재
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname.startsWith(href)
                  ? "text-[#111111] font-medium"
                  : "text-gray-400 hover:text-[#111111]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
