import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content } = await req.json()

  // 마지막 600자만 보내서 토큰 절약
  const context = content.slice(-600)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 한국어 블로그 작가입니다. 아래 글의 흐름을 읽고, 이 다음에 올 자연스러운 문장 딱 1개만 제안하세요.

규칙:
- 문장 1개만. 그 이상 쓰지 마세요.
- 저자의 문체와 톤을 그대로 따르세요
- 마크다운 헤딩(##)이나 구분선(---)으로 시작하지 마세요
- 따옴표나 설명 없이 문장만 반환하세요`,
        },
        {
          role: 'user',
          content: context,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'API 오류' }, { status: 500 })
  }

  const data = await res.json()
  const sentence = data.choices[0].message.content.trim()
  return NextResponse.json({ sentence })
}
