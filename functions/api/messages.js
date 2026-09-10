const allowedPapers = new Set(['lined', 'grid', 'dots', 'plain'])

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  },
})

const cleanText = value => String(value ?? '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .trim()

const hasValidLength = (value, minimum, maximum) => {
  const length = Array.from(value).length
  return length >= minimum && length <= maximum
}

const getDatabase = env => env.MESSAGES_DB

export async function onRequestGet({ env }) {
  const database = getDatabase(env)
  if (!database) return jsonResponse({ error: '留言数据库尚未绑定。' }, 503)

  try {
    const { results = [] } = await database.prepare(`
      SELECT id, name, message, paper, created_at AS createdAt
      FROM messages
      WHERE is_visible = 1
      ORDER BY created_at DESC, id DESC
      LIMIT 50
    `).all()
    return jsonResponse({ messages: results })
  } catch {
    return jsonResponse({ error: '留言暂时无法读取。' }, 500)
  }
}

export async function onRequestPost({ request, env }) {
  const database = getDatabase(env)
  if (!database) return jsonResponse({ error: '留言数据库尚未绑定。' }, 503)
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse({ error: '留言格式不正确。' }, 415)
  }
  if (Number(request.headers.get('content-length') || 0) > 5000) {
    return jsonResponse({ error: '留言内容过长。' }, 413)
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: '留言格式不正确。' }, 400)
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse({ error: '留言格式不正确。' }, 400)
  }

  if (cleanText(payload.website)) return jsonResponse({ error: '留言未通过验证。' }, 400)

  const name = cleanText(payload.name).replace(/\s+/g, ' ')
  const message = cleanText(payload.message)
  const paper = allowedPapers.has(payload.paper) ? payload.paper : 'lined'

  if (!hasValidLength(name, 1, 30)) return jsonResponse({ error: '称呼需要控制在 1–30 个字以内。' }, 400)
  if (!hasValidLength(message, 4, 500)) return jsonResponse({ error: '留言需要控制在 4–500 个字以内。' }, 400)

  const savedMessage = {
    id: crypto.randomUUID(),
    name,
    message,
    paper,
    createdAt: new Date().toISOString(),
  }

  try {
    await database.prepare(`
      INSERT INTO messages (id, name, message, paper, created_at, is_visible)
      VALUES (?, ?, ?, ?, ?, 1)
    `).bind(
      savedMessage.id,
      savedMessage.name,
      savedMessage.message,
      savedMessage.paper,
      savedMessage.createdAt,
    ).run()
    return jsonResponse({ message: savedMessage }, 201)
  } catch {
    return jsonResponse({ error: '留言保存失败，请稍后再试。' }, 500)
  }
}
