import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import matter from 'gray-matter'

const OWNER = 'EXPOIR0405'
const REPO = 'marginalia'

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function checkAuth() {
  if (!process.env.ADMIN_PASSWORD) return false
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.length > 0 && !slug.includes('..') && !slug.includes('/')
}

function yamlStr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '').replace(/\n/g, '\\n')
}

// GET - 목록 조회 or 단일 파일 조회
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

    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/writings/${slug}.mdx`,
      { headers: githubHeaders() }
    )
    if (!res.ok) return NextResponse.json({ error: '파일 없음' }, { status: 404 })

    const data = await res.json()
    const raw = Buffer.from(data.content, 'base64').toString('utf-8')
    const { data: frontmatter, content } = matter(raw)

    return NextResponse.json({ sha: data.sha, content: content.trimStart(), ...frontmatter })
  }

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/content/writings`,
    { headers: githubHeaders() }
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

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: '잘못된 슬러그' }, { status: 400 })
  }

  const lines = [
    '---',
    `title: "${yamlStr(title)}"`,
    `date: "${yamlStr(date)}"`,
    `tags: [${(tags as string[]).map((t) => `"${yamlStr(t)}"`).join(', ')}]`,
    ...(series ? [`series: "${yamlStr(series)}"`] : []),
    ...(episode !== undefined && episode !== '' ? [`episode: ${episode}`] : []),
    `excerpt: "${yamlStr(excerpt)}"`,
    ...(image ? [`image: "${yamlStr(image)}"`] : []),
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
    { method: 'PUT', headers: githubHeaders(), body: JSON.stringify(body) }
  )

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message ?? 'GitHub API 오류' }, { status: 500 })
  }

  const resJson = await res.json()

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (hookUrl) await fetch(hookUrl, { method: 'POST' }).catch(() => null)

  // Fix: return new SHA so client can update state and avoid 409 on second save
  return NextResponse.json({ ok: true, path, sha: resJson.content?.sha ?? null })
}
