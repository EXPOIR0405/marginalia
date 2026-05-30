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

// GET - 목록 조회 or 단일 파일 조회
export async function GET(req: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (slug) {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/writings/${slug}.mdx`,
      { headers: githubHeaders }
    )
    if (!res.ok) return NextResponse.json({ error: '파일 없음' }, { status: 404 })

    const data = await res.json()
    const raw = Buffer.from(data.content, 'base64').toString('utf-8')
    const { data: frontmatter, content } = matter(raw)

    return NextResponse.json({ sha: data.sha, content, ...frontmatter })
  }

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/writings`,
    { headers: githubHeaders }
  )
  if (!res.ok) return NextResponse.json({ error: 'GitHub API 오류' }, { status: 500 })

  const files = await res.json()
  const writings = (files as { name: string; sha: string }[])
    .filter((f) => f.name.endsWith('.mdx'))
    .map((f) => ({ slug: f.name.replace('.mdx', '') }))

  return NextResponse.json({ writings })
}

// POST - 새 글 생성 or 기존 글 수정 (sha 있으면 수정)
export async function POST(req: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug, title, date, series, episode, excerpt, tags, image, content, sha, draft } =
    await req.json()

  const lines = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `tags: [${(tags as string[]).map((t) => `"${t}"`).join(', ')}]`,
    ...(series ? [`series: "${series}"`] : []),
    ...(episode !== undefined && episode !== '' ? [`episode: ${episode}`] : []),
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    ...(image ? [`image: "${image}"`] : []),
    ...(draft ? [`draft: true`] : []),
    '---',
    '',
    content,
  ]

  const mdxContent = lines.join('\n')
  const encoded = Buffer.from(mdxContent).toString('base64')
  const path = `content/writings/${slug}.mdx`

  const body: Record<string, unknown> = {
    message: sha ? `Update writing: ${title}` : `Add writing: ${title}`,
    content: encoded,
  }
  if (sha) body.sha = sha

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: githubHeaders,
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json(
      { error: err.message ?? 'GitHub API 오류' },
      { status: 500 }
    )
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (hookUrl) {
    await fetch(hookUrl, { method: 'POST' }).catch(() => null)
  }

  return NextResponse.json({ ok: true, path })
}
