'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const DEFAULT_SERIES = '주니어 PM으로 살아남기'

type Message = { type: 'success' | 'error'; text: string }
type Topic = { title: string; description: string }

export default function EditorClient() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [series, setSeries] = useState(DEFAULT_SERIES)
  const [episode, setEpisode] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('PM, 커리어')
  const [imageUrl, setImageUrl] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  // AI 다듬기
  const [refining, setRefining] = useState(false)
  const [refinedContent, setRefinedContent] = useState('')
  const [showCompare, setShowCompare] = useState(false)

  // 소재 추천
  const [showTopics, setShowTopics] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)

  // 문장 제안
  const [suggestionEnabled, setSuggestionEnabled] = useState(false)
  const [sentenceSuggestion, setSentenceSuggestion] = useState('')
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [suggestionError, setSuggestionError] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!suggestionEnabled || !content.trim()) {
      setSentenceSuggestion('')
      setSuggestionError('')
      return
    }
    setSentenceSuggestion('')
    setSuggestionError('')

    let cancelled = false

    const timer = setTimeout(async () => {
      if (cancelled) return
      setLoadingSuggestion(true)
      try {
        const res = await fetch('/api/admin/suggest-sentence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
        const data = await res.json()
        if (cancelled) return
        if (res.ok && data.sentence) {
          setSentenceSuggestion(data.sentence)
        } else {
          setSuggestionError(data.error ?? '빈 응답')
        }
      } catch {
        if (!cancelled) setSuggestionError('네트워크 오류')
      } finally {
        if (!cancelled) setLoadingSuggestion(false)
      }
    }, 4000)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [content, suggestionEnabled])

  function insertSuggestion() {
    setContent((prev) => prev + (prev.endsWith('\n') ? '' : '\n') + sentenceSuggestion)
    setSentenceSuggestion('')
  }

  async function handleImageUpload(file: File) {
    setImageUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (res.ok) {
      setImageUrl(data.url)
    } else {
      setMessage({ type: 'error', text: `이미지 업로드 실패: ${data.error}` })
    }
    setImageUploading(false)
  }

  async function handleRefine() {
    if (!content) {
      setMessage({ type: 'error', text: '본문을 먼저 작성해 주세요.' })
      return
    }
    setRefining(true)
    setMessage(null)
    const res = await fetch('/api/admin/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    if (res.ok) {
      setRefinedContent(data.refined)
      setShowCompare(true)
    } else {
      setMessage({ type: 'error', text: data.error ?? 'AI 다듬기 실패' })
    }
    setRefining(false)
  }

  function applyRefined() {
    setContent(refinedContent)
    setShowCompare(false)
    setRefinedContent('')
  }

  async function handleSuggestTopics() {
    setLoadingTopics(true)
    setShowTopics(true)
    setTopics([])
    const res = await fetch('/api/admin/suggest-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series }),
    })
    const data = await res.json()
    if (res.ok) setTopics(data.topics)
    setLoadingTopics(false)
  }

  async function handleSave() {
    if (!title || !slug || !excerpt || !content) {
      setMessage({ type: 'error', text: '제목, 슬러그, 한줄소개, 본문은 필수입니다.' })
      return
    }
    setSaving(true)
    setMessage(null)
    const res = await fetch('/api/admin/writings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        title,
        date,
        series: series || undefined,
        episode: episode !== '' ? Number(episode) : undefined,
        excerpt,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        image: imageUrl || undefined,
        content,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'success', text: `저장 완료! content/writings/${slug}.mdx 가 GitHub에 커밋됐어요.` })
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
          <p className="text-xs text-gray-400 tracking-widest uppercase">Admin</p>
          <p className="text-sm font-semibold">새 글 쓰기</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <p className={`text-xs max-w-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
          {/* 문장 제안 토글 */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-gray-400">문장 제안</span>
            <button
              role="switch"
              aria-checked={suggestionEnabled}
              onClick={() => setSuggestionEnabled((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                suggestionEnabled ? 'bg-indigo-400' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  suggestionEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
          <div className="w-px h-5 bg-gray-100" />
          <button
            onClick={handleSuggestTopics}
            disabled={loadingTopics}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            소재 추천
          </button>
          <button
            onClick={handleRefine}
            disabled={refining || saving}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            {refining ? 'AI 다듬는 중...' : 'AI 다듬기'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || refining}
            className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : 'GitHub에 저장'}
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 메타데이터 */}
        <aside className="w-72 shrink-0 border-r border-gray-100 overflow-y-auto p-6 space-y-5">
          <Field label="슬러그 *">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="junior-pm-survival-4" className={input} />
            <p className="text-xs text-gray-400 mt-1 font-mono">content/writings/{slug || '…'}.mdx</p>
          </Field>
          <Field label="날짜">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
          </Field>
          <Field label="시리즈">
            <input value={series} onChange={(e) => setSeries(e.target.value)} placeholder="주니어 PM으로 살아남기" className={input} />
          </Field>
          <Field label="EP 번호">
            <input type="number" value={episode} onChange={(e) => setEpisode(e.target.value)} placeholder="4" className={input} />
          </Field>
          <Field label="한줄 소개 *">
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="이 글을 한 줄로 소개하면..." rows={3} className={`${input} resize-none`} />
          </Field>
          <Field label="태그 (쉼표로 구분)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="PM, 커리어, 성장" className={input} />
          </Field>
          <Field label="썸네일 이미지">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file) }} />
            {imageUrl ? (
              <div className="space-y-2">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100">
                  <Image src={imageUrl} alt="thumbnail" fill className="object-cover" />
                </div>
                <button onClick={() => setImageUrl('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">이미지 제거</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={imageUploading} className="w-full py-8 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
                {imageUploading ? '업로드 중...' : '클릭해서 이미지 선택'}
              </button>
            )}
          </Field>
        </aside>

        {/* 오른쪽: 본문 에디터 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 pt-6 pb-4 border-b border-gray-50">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full text-xl font-bold focus:outline-none placeholder:text-gray-300" />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`## EP.${episode || '?'} 제목\n\n본문을 마크다운으로 작성하세요...\n\n이미지 삽입: ![설명](이미지-URL)`}
            className="flex-1 min-h-0 p-8 font-mono text-sm leading-relaxed focus:outline-none resize-none text-gray-800 placeholder:text-gray-300"
          />

          {/* 문장 제안 바 */}
          {suggestionEnabled && (sentenceSuggestion || loadingSuggestion || suggestionError) && (
            <div className="px-8 py-3 border-t border-indigo-50 bg-indigo-50/40 flex items-center gap-3">
              <span className="text-xs text-indigo-400 shrink-0">💡</span>
              {loadingSuggestion ? (
                <span className="text-xs text-gray-400 italic">제안 문장 불러오는 중...</span>
              ) : suggestionError ? (
                <span className="text-xs text-red-400">{suggestionError}</span>
              ) : (
                <>
                  <span className="text-xs text-gray-600 italic flex-1">{sentenceSuggestion}</span>
                  <button onClick={insertSuggestion} className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors shrink-0">
                    삽입
                  </button>
                  <button onClick={() => setSentenceSuggestion('')} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">
                    무시
                  </button>
                </>
              )}
            </div>
          )}

          <div className="px-8 py-2 border-t border-gray-50 flex items-center gap-4">
            <p className="text-xs text-gray-400">{content.length.toLocaleString()}자</p>
            <p className="text-xs text-gray-300">
              읽기 시간 약 {Math.max(1, Math.ceil(content.replace(/\s/g, '').length / 500))}분
            </p>
          </div>
        </div>
      </div>

      {/* 소재 추천 모달 */}
      {showTopics && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">소재 추천</p>
                <p className="text-xs text-gray-400 mt-0.5">마음에 드는 소재를 클릭하면 제목에 바로 들어가요</p>
              </div>
              <button onClick={() => setShowTopics(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <div className="p-6">
              {loadingTopics ? (
                <div className="py-12 text-center text-sm text-gray-400">AI가 소재를 떠올리는 중...</div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => { setTitle(topic.title); setShowTopics(false) }}
                      className="w-full text-left px-4 py-3 border border-gray-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
                    >
                      <p className="text-sm font-medium group-hover:text-indigo-700 transition-colors">{topic.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{topic.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI 비교 모달 */}
      {showCompare && (
        <div className="fixed inset-0 z-50 bg-black/40 flex flex-col">
          <div className="bg-white flex-1 flex flex-col m-4 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <p className="text-sm font-semibold">AI 다듬기 결과</p>
                <p className="text-xs text-gray-400 mt-0.5">오른쪽이 마음에 들면 적용하세요. 직접 수정도 가능해요.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowCompare(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">취소</button>
                <button onClick={applyRefined} className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">적용</button>
              </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-gray-100">
                <p className="px-6 py-3 text-xs font-medium text-gray-400 border-b border-gray-50 bg-gray-50/50">원본</p>
                <textarea readOnly value={content} className="flex-1 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none text-gray-500 bg-gray-50/30" />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="px-6 py-3 text-xs font-medium text-indigo-500 border-b border-gray-50 bg-indigo-50/30">AI 다듬기</p>
                <textarea value={refinedContent} onChange={(e) => setRefinedContent(e.target.value)} className="flex-1 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none text-gray-800" />
              </div>
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
