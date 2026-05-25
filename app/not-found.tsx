import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center text-center">
      <div className="relative w-44 h-64 mb-8 opacity-90">
        <Image
          src="/Poster.png"
          alt="The Library of Babel"
          fill
          className="object-contain"
        />
      </div>

      <p className="text-xs text-gray-400 tracking-widest uppercase mb-3">404</p>
      <h1 className="text-xl font-bold tracking-tight mb-3">
        이 페이지는 바벨의 도서관에서 사라진 것 같아요
      </h1>
      <p className="text-sm text-gray-400 leading-relaxed mb-8">
        무한한 책들 사이 어딘가에 있을 테지만,<br />
        지금 당장은 찾기 어려울 것 같습니다.
      </p>

      <Link
        href="/"
        className="text-sm text-gray-900 border-b border-gray-300 hover:border-gray-900 transition-colors pb-0.5"
      >
        서재로 돌아가기
      </Link>
    </div>
  );
}
