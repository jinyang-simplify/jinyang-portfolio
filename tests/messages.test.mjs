import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequestGet, onRequestPost } from '../functions/api/messages.js'

class MockDatabase {
  rows = []

  prepare(sql) {
    if (sql.includes('SELECT')) {
      return {
        all: async () => ({
          results: this.rows
            .filter(row => row.isVisible === 1)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
            .slice(0, 50),
        }),
      }
    }

    return {
      bind: (id, name, message, paper, createdAt) => ({
        run: async () => {
          this.rows.push({ id, name, message, paper, createdAt, isVisible: 1 })
          return { success: true }
        },
      }),
    }
  }
}

const postMessage = (database, payload) => onRequestPost({
  env: { MESSAGES_DB: database },
  request: new Request('https://portfolio.example/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
})

test('公开留言写入 D1 后可以被所有访客读取', async () => {
  const database = new MockDatabase()
  const createResponse = await postMessage(database, {
    name: '访客',
    message: '这个作品集很有启发。',
    paper: 'grid',
    website: '',
  })

  assert.equal(createResponse.status, 201)
  const created = await createResponse.json()
  assert.equal(created.message.name, '访客')
  assert.equal(database.rows.length, 1)

  const listResponse = await onRequestGet({ env: { MESSAGES_DB: database } })
  assert.equal(listResponse.status, 200)
  const listed = await listResponse.json()
  assert.equal(listed.messages.length, 1)
  assert.equal(listed.messages[0].message, '这个作品集很有启发。')
})

test('新数据库默认返回空留言墙', async () => {
  const response = await onRequestGet({ env: { MESSAGES_DB: new MockDatabase() } })
  assert.deepEqual(await response.json(), { messages: [] })
})

test('过短留言不会写入数据库', async () => {
  const database = new MockDatabase()
  const response = await postMessage(database, { name: '访客', message: '你好', paper: 'lined' })
  assert.equal(response.status, 400)
  assert.equal(database.rows.length, 0)
})

test('缺少 D1 绑定时明确返回服务不可用', async () => {
  const response = await onRequestGet({ env: {} })
  assert.equal(response.status, 503)
})
