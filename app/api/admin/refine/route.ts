import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content } = await req.json()

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
          content: `당신은 베스트셀러 작가이자 편집자입니다. 저자가 쓴 초안을 받아서, 내용과 경험은 그대로 유지하되 독자가 끝까지 읽고 싶어지는 글로 완전히 다시 씁니다.

목표:
- 첫 문장부터 독자를 잡아끄는 훅이 있어야 합니다
- 유머와 위트가 자연스럽게 녹아있어야 합니다 (억지스럽지 않게)
- 문장 리듬이 살아있어야 합니다. 짧은 문장과 긴 문장을 섞어서 읽는 맛이 있게.
- 개인적인 경험을 서술할 때 독자가 "나도 이런 적 있는데" 하고 공감하게 만드세요
- 군더더기 없이 핵심만, 하지만 건조하지 않게
- 저자가 20~30대 한국인 여성 주니어 PM이라는 목소리를 유지하세요
- 내용과 사실은 절대 바꾸지 마세요. 없는 내용을 추가하지 마세요
- 마크다운 문법(##, ###, **, ![...], --- 등)은 그대로 유지하세요
- 앞뒤 설명 없이 완성된 본문만 반환하세요`,
        },
        {
          role: 'user',
          content,
        },
      ],
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json(
      { error: err.error?.message ?? 'OpenAI API 오류' },
      { status: 500 }
    )
  }

  const data = await res.json()
  const refined = data.choices[0].message.content

  return NextResponse.json({ refined })
}
