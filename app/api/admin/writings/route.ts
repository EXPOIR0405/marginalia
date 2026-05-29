import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const OWNER = 'EXPOIR0405'
const REPO = 'marginalia'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug, title, date, series, episode, excerpt, tags, image, content } =
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
    '---',
    '',
    content,
  ]

  const mdxContent = lines.join('\n')
  const encoded = Buffer.from(mdxContent).toString('base64')
  const path = `content/writings/${slug}.mdx`

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message: `Add writing: ${title}`,
        content: encoded,
      }),
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
