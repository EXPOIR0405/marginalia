"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FooterEasterEgg() {
  const router = useRouter();
  const [clicks, setClicks] = useState(0);
  const [hint, setHint] = useState(false);

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);

    if (next === 3) {
      setHint(true);
      setTimeout(() => {
        router.push("/games");
      }, 600);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="text-sm text-gray-400 hover:text-gray-400 cursor-default select-none"
      >
        © 2026 강민정의 서재
      </button>
      {hint && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-300 whitespace-nowrap animate-pulse">
          🎮 숨겨진 문이 열립니다...
        </span>
      )}
    </div>
  );
}
