# 2026-05-30 보안 및 버그 수정

어드민 에디터(연재글/책) API 라우트와 클라이언트 컴포넌트에서 발견된 9개 이슈 수정.

---

## 수정 파일

- `app/api/admin/books/route.ts`
- `app/api/admin/writings/route.ts`
- `app/admin/editor/BookEditor.tsx`
- `app/admin/editor/WritingEditor.tsx`

---

## 버그 수정

### 1. 인증 우회 (Critical)
**파일:** `books/route.ts`, `writings/route.ts`

`ADMIN_PASSWORD` 환경변수가 설정되지 않은 경우 `undefined === undefined` 조건이 `true`가 되어 인증 없이 API 접근이 가능했음. 미들웨어는 `/admin/editor` 페이지 경로만 보호하므로 API 라우트는 직접 노출 상태였음.

```typescript
// 수정 전
async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

// 수정 후
async function checkAuth() {
  if (!process.env.ADMIN_PASSWORD) return false
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}
```

---

### 2. 책 두 번째 저장 시 GitHub 422 오류 (Critical)
**파일:** `books/route.ts`, `BookEditor.tsx`

새 책 저장 성공 후 서버가 `{ ok: true }`만 반환하고 새 SHA를 포함하지 않았음. 클라이언트는 `sha` 상태를 갱신하지 않아 두 번째 저장 시 SHA 없이 PUT 요청 → GitHub 422.

- 서버: GitHub PUT 응답에서 `content.sha` 추출 후 반환
- 클라이언트: 저장 성공 시 `setSha(data.sha)`, `setEssaySha(data.essaySha)` 호출

---

### 3. 연재글 두 번째 수정 저장 시 GitHub 409 오류 (High)
**파일:** `writings/route.ts`, `WritingEditor.tsx`

기존 글 수정 저장 시 `if (!fileSha)` 조건으로 인해 새 글 생성 시에만 SHA를 갱신했음. 기존 글을 수정 후 같은 세션에서 다시 저장하면 로드 시점 SHA(이미 만료됨)를 전송 → GitHub 409.

```typescript
// 수정 전 — 새 글일 때만 SHA 갱신
if (!fileSha) {
  const reloaded = await fetch(`/api/admin/writings?slug=${slug}`)
  const reloadedData = await reloaded.json()
  if (reloaded.ok) setFileSha(reloadedData.sha)
}

// 수정 후 — 항상 갱신 (서버가 새 SHA 반환)
setFileSha(data.sha ?? fileSha)
```

---

### 4. 에세이 저장 실패 무음 처리 (High)
**파일:** `books/route.ts`

`essay.mdx` PUT 실패 시 `.catch(() => null)`로 에러를 삼키고 `{ ok: true }` 반환. 사용자는 성공 메시지를 보지만 에세이는 저장되지 않은 상태로 배포됨. (`hasEssay: true`인데 파일 없음)

```typescript
// 수정 전
await fetch(...).catch(() => null)  // 실패 무시

// 수정 후
const essayRes = await fetch(...)
if (!essayRes.ok) {
  const err = await essayRes.json()
  return NextResponse.json({ error: `에세이 저장 실패: ${err.message}` }, { status: 500 })
}
```

---

### 5. YAML 프런트매터 인젝션 (Medium)
**파일:** `books/route.ts`, `writings/route.ts`

`title`, `author`, `excerpt`는 `"` 이스케이프 처리가 되어 있었으나 `readDate`, `isbn`, `tags`, `date`, `series`, `image`는 미처리 상태였음. 줄바꿈 문자 포함 시 프런트매터 구조 파괴 또는 임의 키 주입 가능.

`yamlStr()` 헬퍼 추가 후 모든 문자열 값에 적용:
```typescript
function yamlStr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '').replace(/\n/g, '\\n')
}
```

---

### 6. 슬러그 경로 순회 (Medium)
**파일:** `books/route.ts`, `writings/route.ts`

`slug`가 검증 없이 GitHub Contents API URL에 삽입됨. `../` 포함 슬러그로 레포 내 임의 파일 읽기/덮어쓰기 가능.

```typescript
function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.length > 0 && !slug.includes('..') && !slug.includes('/')
}
```

---

### 7. 저장마다 빈 줄 누적 (Low)
**파일:** `books/route.ts`

`gray-matter`가 반환하는 `content`에 선행 `\n`이 포함되어 있고, `indexLines`에 이미 `''` 요소가 있어 저장마다 본문 앞에 빈 줄이 하나씩 추가됨.

```typescript
// 수정 전
noteContent ?? '',

// 수정 후
(noteContent ?? '').trimStart(),
```

GET에서도 반환 시 `noteContent.trimStart()` 적용.

---

### 8. 에세이 `---` 시작 시 내용 소실 (Low)
**파일:** `books/route.ts`

`essay.mdx` 로딩 시 `matter()`를 사용해 파싱하면 본문이 `---`로 시작할 경우 해당 블록을 프런트매터로 해석해 삭제함. 에세이는 프런트매터 없이 저장되므로 `matter()` 대신 raw 텍스트로 직접 반환하도록 수정.

---

### 9. 목록 API 실패 시 에러 미표시 (Low)
**파일:** `BookEditor.tsx`, `WritingEditor.tsx`

불러오기 모달에서 API 호출 실패 시 `loadableBooks`가 빈 배열로 유지되어 "등록된 책이 없어요"가 표시됨. 인증 만료(401)와 실제 빈 목록을 구분할 수 없었음.

```typescript
// 수정 후
if (res.ok) {
  setLoadableBooks(data.books)
} else {
  setMessage({ type: 'error', text: data.error ?? '목록 불러오기 실패' })
  setShowLoadModal(false)
}
```

---

## 부가 개선

- `githubHeaders`를 모듈 레벨 상수 → 함수로 변경 (토큰이 모듈 초기화 시 고정되던 문제 해소)
- `index.mdx`와 `essay.mdx` GitHub API 호출 병렬화 (`Promise.all`)
- 서버에서 새 SHA 직접 반환 (클라이언트 재조회 round-trip 제거)
