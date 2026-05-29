import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { series } = await req.json()

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 블로그 소재 전문가입니다. 아래 시리즈를 연재 중인 20~30대 한국인 여성 주니어 PM을 위한 다음 에피소드 소재 5개를 추천해 주세요.

조건:
- 주니어 PM이 실무에서 겪는 공감 가는 상황이어야 합니다
- 제목은 짧고 강렬하게 (15자 이내)
- 한 줄 설명은 "이 글을 왜 읽어야 하는지"를 자극해야 합니다
- 반드시 아래 형식의 JSON으로만 반환하세요. 설명 없이.

{"topics": [{"title": "...", "description": "..."}, ...]}`,
        },
        {
          role: 'user',
          content: `시리즈명: ${series}`,
        },
      ],
      temperature: 0.9,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.error?.message ?? 'OpenAI API 오류' }, { status: 500 })
  }

  const data = await res.json()
  const raw = data.choices[0].message.content

  try {
    const parsed = JSON.parse(raw)
    const topics = parsed.topics ?? []
    return NextResponse.json({ topics })
  } catch {
    return NextResponse.json({ error: '파싱 실패' }, { status: 500 })
  }
}
