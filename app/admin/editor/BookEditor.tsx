'use client'

import { useState } from 'react'

type Message = { type: 'success' | 'error'; text: string }

export default function BookEditor() {
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [readDate, setReadDate] = useState(new Date().toISOString().slice(0, 10))
  const [isbn, setIsbn] = useState('')
  const [tags, setTags] = useState('')
  const [rating, setRating] = useState(0)
  const [oneLineSummary, setOneLineSummary] = useState('')
  const [recommend, setRecommend] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [essayContent, setEssayContent] = useState('')
  const [contentTab, setContentTab] = useState<'note' | 'essay'>('note')

  const [sha, setSha] = useState<string | null>(null)
  const [essaySha, setEssaySha] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const [showLoadModal, setShowLoadModal] = useState(false)
  const [loadableBooks, setLoadableBooks] = useState<{ slug: string }[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)

  function resetForm() {
    setSlug(''); setTitle(''); setAuthor('')
    setReadDate(new Date().toISOString().slice(0, 10))
    setIsbn(''); setTags(''); setRating(0); setOneLineSummary('')
    setRecommend(false); setNoteContent(''); setEssayContent('')
    setSha(null); setEssaySha(null); setMessage(null)
  }

  async function handleOpenLoadModal() {
    setShowLoadModal(true)
    setLoadingList(true)
    const res = await fetch('/api/admin/books')
    const data = await res.json()
    if (res.ok) setLoadableBooks(data.books)
    setLoadingList(false)
  }

  async function handleLoadBook(selectedSlug: string) {
    setLoadingFile(true)
    const res = await fetch(`/api/admin/books?slug=${selectedSlug}`)
    const data = await res.json()
    if (!res.ok) {
      setMessage({ type: 'error', text: '불러오기 실패' })
      setLoadingFile(false)
      return
    }
    setSlug(selectedSlug)
    setTitle(data.title ?? '')
    setAuthor(data.author ?? '')
    setReadDate(data.readDate ?? new Date().toISOString().slice(0, 10))
    setIsbn(data.isbn ?? '')
    setTags((data.tags ?? []).join(', '))
    setRating(data.rating ?? 0)
    setOneLineSummary(data.oneLineSummary ?? '')
    setRecommend(data.recommend ?? false)
    setNoteContent(data.noteContent ?? '')
    setEssayContent(data.essayContent ?? '')
    setSha(data.sha)
    setEssaySha(data.essaySha ?? null)
    setMessage(null)
    setLoadingFile(false)
    setShowLoadModal(false)
  }

  async function handleSave() {
    if (!title || !slug || !author || !oneLineSummary) {
      setMessage({ type: 'error', text: '제목, 슬러그, 저자, 한줄 요약은 필수입니다.' })
      return
    }
    setSaving(true)
    setMessage(null)
    const res = await fetch('/api/admin/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug, title, author, readDate, isbn: isbn || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        rating, oneLineSummary, recommend,
        noteContent, essayContent,
        sha: sha || undefined,
        essaySha: essaySha || undefined,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'success', text: `${sha ? '수정' : '저장'} 완료! GitHub에 커밋됐어요.` })
    } else {
      setMessage({ type: 'error', text: data.error ?? '저장 실패' })
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 바 */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs text-gray-400 tracking-widest uppercase">Admin · 책</p>
          <p className="text-sm font-semibold">{sha ? `수정 중: ${slug}` : '새 책 추가'}</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <p className={`text-xs max-w-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
          {sha && (
            <button onClick={resetForm} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
              새 책 추가
            </button>
          )}
          <button onClick={handleOpenLoadModal} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            기존 책 불러오기
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : sha ? 'GitHub에 수정' : 'GitHub에 저장'}
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 메타데이터 */}
        <aside className="w-72 shrink-0 border-r border-gray-100 overflow-y-auto p-6 space-y-5">
          <Field label="슬러그 *">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="일류의-조건" className={input} />
            <p className="text-xs text-gray-400 mt-1 font-mono">content/books/{slug || '…'}/</p>
          </Field>
          <Field label="제목 *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="책 제목" className={input} />
          </Field>
          <Field label="저자 *">
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자명" className={input} />
          </Field>
          <Field label="읽은 날짜">
            <input type="date" value={readDate} onChange={(e) => setReadDate(e.target.value)} className={input} />
          </Field>
          <Field label="ISBN">
            <input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="9791234567890" className={input} />
          </Field>
          <Field label="태그 (쉼표로 구분)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="에세이, 성장" className={input} />
          </Field>
          <Field label="별점">
            <div className="flex gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className={`text-xl transition-colors ${star <= rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </Field>
          <Field label="한줄 요약 *">
            <textarea value={oneLineSummary} onChange={(e) => setOneLineSummary(e.target.value)} rows={3} placeholder="이 책을 한 줄로 요약하면..." className={`${input} resize-none`} />
          </Field>
          <Field label="추천 여부">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                role="switch"
                aria-checked={recommend}
                onClick={() => setRecommend((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${recommend ? 'bg-green-400' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${recommend ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-xs text-gray-500">{recommend ? '추천해요' : '추천 안 함'}</span>
            </label>
          </Field>
        </aside>

        {/* 오른쪽: 노트 / 에세이 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 탭 */}
          <div className="flex border-b border-gray-100 px-8 pt-4 gap-4">
            {(['note', 'essay'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setContentTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  contentTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'note' ? '노트' : '에세이'}
              </button>
            ))}
          </div>

          {contentTab === 'note' ? (
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="책을 읽으며 기록한 노트, 인상 깊은 구절, 생각들..."
              className="flex-1 min-h-0 p-8 font-mono text-sm leading-relaxed focus:outline-none resize-none text-gray-800 placeholder:text-gray-300"
            />
          ) : (
            <textarea
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
              placeholder="이 책에서 촉발된 나만의 에세이를 써보세요..."
              className="flex-1 min-h-0 p-8 font-mono text-sm leading-relaxed focus:outline-none resize-none text-gray-800 placeholder:text-gray-300"
            />
          )}

          <div className="px-8 py-2 border-t border-gray-50 flex items-center gap-4">
            <p className="text-xs text-gray-400">
              {contentTab === 'note' ? noteContent.length : essayContent.length}자
            </p>
          </div>
        </div>
      </div>

      {/* 기존 책 불러오기 모달 */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">기존 책 불러오기</p>
                <p className="text-xs text-gray-400 mt-0.5">선택하면 현재 내용이 교체돼요</p>
              </div>
              <button onClick={() => setShowLoadModal(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <div className="p-4">
              {loadingList || loadingFile ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  {loadingFile ? '파일 불러오는 중...' : '목록 불러오는 중...'}
                </div>
              ) : loadableBooks.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">등록된 책이 없어요</div>
              ) : (
                <div className="space-y-1">
                  {loadableBooks.map((b) => (
                    <button
                      key={b.slug}
                      onClick={() => handleLoadBook(b.slug)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <p className="text-sm font-mono text-gray-700 group-hover:text-gray-900">{b.slug}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const input = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium mb-1.5">{label}</p>
      {children}
    </div>
  )
}
