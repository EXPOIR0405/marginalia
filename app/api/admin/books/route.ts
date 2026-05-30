import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import matter from 'gray-matter'

const OWNER = 'EXPOIR0405'
const REPO = 'marginalia'

const githubHeaders = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
}

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

// GET - 목록 or 단일 책 (노트 + 에세이)
export async function GET(req: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (slug) {
    const indexRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/index.mdx`,
      { headers: githubHeaders }
    )
    if (!indexRes.ok) return NextResponse.json({ error: '파일 없음' }, { status: 404 })

    const indexData = await indexRes.json()
    const raw = Buffer.from(indexData.content, 'base64').toString('utf-8')
    const { data: frontmatter, content: noteContent } = matter(raw)

    // 에세이는 없을 수도 있음
    const essayRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/essay.mdx`,
      { headers: githubHeaders }
    )
    let essayContent = ''
    let essaySha: string | null = null
    if (essayRes.ok) {
      const essayData = await essayRes.json()
      const essayRaw = Buffer.from(essayData.content, 'base64').toString('utf-8')
      const { content: ec } = matter(essayRaw)
      essayContent = ec
      essaySha = essayData.sha
    }

    return NextResponse.json({ sha: indexData.sha, essaySha, noteContent, essayContent, ...frontmatter })
  }

  // 목록 조회
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books`,
    { headers: githubHeaders }
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

  const hasEssay = Boolean(essayContent?.trim())

  const indexLines = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `author: "${author.replace(/"/g, '\\"')}"`,
    `readDate: "${readDate}"`,
    ...(isbn ? [`isbn: "${isbn}"`] : []),
    `tags: [${(tags as string[]).map((t) => `"${t}"`).join(', ')}]`,
    `rating: ${rating}`,
    `oneLineSummary: "${oneLineSummary.replace(/"/g, '\\"')}"`,
    `recommend: ${recommend}`,
    `hasEssay: ${hasEssay}`,
    '---',
    '',
    noteContent ?? '',
  ]

  const indexBody: Record<string, unknown> = {
    message: sha ? `Update book: ${title}` : `Add book: ${title}`,
    content: Buffer.from(indexLines.join('\n')).toString('base64'),
  }
  if (sha) indexBody.sha = sha

  const indexRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/index.mdx`,
    { method: 'PUT', headers: githubHeaders, body: JSON.stringify(indexBody) }
  )
  if (!indexRes.ok) {
    const err = await indexRes.json()
    return NextResponse.json({ error: err.message ?? 'GitHub API 오류' }, { status: 500 })
  }

  // 에세이 저장
  if (hasEssay) {
    const essayBody: Record<string, unknown> = {
      message: essaySha ? `Update essay: ${title}` : `Add essay: ${title}`,
      content: Buffer.from(essayContent.trim()).toString('base64'),
    }
    if (essaySha) essayBody.sha = essaySha

    await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/books/${slug}/essay.mdx`,
      { method: 'PUT', headers: githubHeaders, body: JSON.stringify(essayBody) }
    ).catch(() => null)
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (hookUrl) await fetch(hookUrl, { method: 'POST' }).catch(() => null)

  return NextResponse.json({ ok: true })
}
