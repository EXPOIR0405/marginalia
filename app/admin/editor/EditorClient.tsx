'use client'

import { useState } from 'react'
import WritingEditor from './WritingEditor'
import BookEditor from './BookEditor'

type Mode = 'writing' | 'book'

export default function EditorClient() {
  const [mode, setMode] = useState<Mode>('writing')

  return (
    <div className="min-h-screen flex flex-col">
      {/* 모드 탭 */}
      <div className="flex border-b border-gray-100 px-6 bg-white">
        {([['writing', '연재글'], ['book', '책']] as [Mode, string][]).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              mode === m
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {mode === 'writing' ? <WritingEditor /> : <BookEditor />}
      </div>
    </div>
  )
}
