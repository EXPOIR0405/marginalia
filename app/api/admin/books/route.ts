import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import matter from 'gray-matter'

const OWNER = 'EXPOIR0405'
const REPO = 'marginalia'

// Fix: function so token is read per-request, not frozen at module load
function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// Fix: explicit guard when ADMIN_PASSWORD is unset (undefined === undefined was true)
async function checkAuth() {
  if (!process.env.ADMIN_PASSWORD) return false
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

// Fix: reject slugs containing path traversal sequences
function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.length > 0 && !slug.includes('..') && !slug.includes('/')
}

// Fix: escape all string values interpolated into YAML frontmatter
function yamlStr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '').replace(/\n/g, '\\n')
}

// GET - 목록 or 단일 책 (노트 + 에세이)
export async function GET(req: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (slug !== null) {
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: '잘못된 슬러그' }, { status: 400 })
    }

    // Fix: parallelize the two independent GitHub fetches
    const [indexRes, essayRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/index.mdx`,
        { headers: githubHeaders() }
      ),
      fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/essay.mdx`,
        { headers: githubHeaders() }
      ),
    ])

    if (!indexRes.ok) return NextResponse.json({ error: '파일 없음' }, { status: 404 })

    const indexData = await indexRes.json()
    const raw = Buffer.from(indexData.content, 'base64').toString('utf-8')
    const { data: frontmatter, content: noteContent } = matter(raw)

    let essayContent = ''
    let essaySha: string | null = null
    if (essayRes.ok) {
      const essayData = await essayRes.json()
      // Fix: read essay as raw text — matter() would silently strip content starting with ---
      essayContent = Buffer.from(essayData.content, 'base64').toString('utf-8')
      essaySha = essayData.sha
    }

    return NextResponse.json({
      sha: indexData.sha,
      essaySha,
      // Fix: trimStart removes the leading \n gray-matter adds, preventing blank-line accumulation
      noteContent: noteContent.trimStart(),
      essayContent,
      ...frontmatter,
    })
  }

  // 목록 조회
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books`,
    { headers: githubHeaders() }
  )
  if (!res.ok) return NextResponse.json({ error: 'GitHub API 오류' }, { status: 500 })

  const items = await res.json()
  const books = (items as { name: string; type: string }[])
    .filter((item) => item.type === 'dir')
    .map((item) => ({ slug: item.name }))

  return NextResponse.json({ books })
}

// POST - 책 생성 or 수정 (index.mdx + essay.mdx)
export async function POST(req: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    slug, title, author, readDate, isbn, tags, rating,
    oneLineSummary, recommend, noteContent, essayContent, sha, essaySha,
  } = await req.json()

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: '잘못된 슬러그' }, { status: 400 })
  }

  const hasEssay = Boolean(essayContent?.trim())

  const indexLines = [
    '---',
    `title: "${yamlStr(title)}"`,
    `author: "${yamlStr(author)}"`,
    // Fix: readDate and isbn were missing yamlStr escaping
    `readDate: "${yamlStr(readDate)}"`,
    ...(isbn ? [`isbn: "${yamlStr(isbn)}"`] : []),
    // Fix: individual tag values were missing escaping
    `tags: [${(tags as string[]).map((t) => `"${yamlStr(t)}"`).join(', ')}]`,
    `rating: ${rating}`,
    `oneLineSummary: "${yamlStr(oneLineSummary)}"`,
    `recommend: ${recommend}`,
    `hasEssay: ${hasEssay}`,
    '---',
    '',
    // Fix: trimStart prevents blank-line accumulation on each round-trip
    (noteContent ?? '').trimStart(),
  ]

  const indexBody: Record<string, unknown> = {
    message: sha ? `Update book: ${title}` : `Add book: ${title}`,
    content: Buffer.from(indexLines.join('\n')).toString('base64'),
  }
  if (sha) indexBody.sha = sha

  const indexRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/index.mdx`,
    { method: 'PUT', headers: githubHeaders(), body: JSON.stringify(indexBody) }
  )
  if (!indexRes.ok) {
    const err = await indexRes.json()
    return NextResponse.json({ error: err.message ?? 'GitHub API 오류' }, { status: 500 })
  }
  const indexJson = await indexRes.json()
  const newSha: string | null = indexJson.content?.sha ?? null

  // 에세이 저장
  let newEssaySha: string | null = null
  if (hasEssay) {
    const essayBody: Record<string, unknown> = {
      message: essaySha ? `Update essay: ${title}` : `Add essay: ${title}`,
      content: Buffer.from(essayContent.trim()).toString('base64'),
    }
    if (essaySha) essayBody.sha = essaySha

    const essayRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/essay.mdx`,
      { method: 'PUT', headers: githubHeaders(), body: JSON.stringify(essayBody) }
    )
    // Fix: essay save failure was swallowed; now it surfaces as an error
    if (!essayRes.ok) {
      const err = await essayRes.json()
      return NextResponse.json(
        { error: `에세이 저장 실패: ${err.message ?? 'GitHub API 오류'}` },
        { status: 500 }
      )
    }
    const essayJson = await essayRes.json()
    newEssaySha = essayJson.content?.sha ?? null
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (hookUrl) await fetch(hookUrl, { method: 'POST' }).catch(() => null)

  // Fix: return new SHAs so client can update state without a round-trip refetch
  return NextResponse.json({ ok: true, sha: newSha, essaySha: newEssaySha })
}
