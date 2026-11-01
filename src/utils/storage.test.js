import test from 'node:test'
import assert from 'node:assert/strict'
import { IDBFactory } from 'fake-indexeddb'
import { createScheduleStorage } from './storage.js'
import { PROJECTS_KEY, TASKS_KEY } from './backup.js'

const projects = [{ id: 'p', name: '旧项目', short: '旧', color: '#5578e7' }]
const tasks = [{ id: 't', title: '旧需求', projectId: 'p', start: '2026-11-01', end: '2026-11-02', status: 'todo', priority: 'medium', note: '旧备注' }]
const legacy = (snapshot) => ({ getItem: key => key === PROJECTS_KEY ? JSON.stringify(snapshot.projects) : key === TASKS_KEY ? JSON.stringify(snapshot.tasks) : null })

test('迁移保留旧版数据，数据库存在时不再从旧数据覆盖', async () => {
  const indexedDB = new IDBFactory()
  const storage = createScheduleStorage({ indexedDB, legacyStorage: legacy({ projects, tasks }) })
  assert.deepEqual(await storage.load(), { projects, tasks })
  await storage.save({ projects: [], tasks: [] })
  const reopened = createScheduleStorage({ indexedDB, legacyStorage: legacy({ projects, tasks }) })
  assert.deepEqual(await reopened.load(), { projects: [], tasks: [] })
})

test('空的旧数据按空数据迁移，不会重新生成演示需求', async () => {
  const storage = createScheduleStorage({ indexedDB: new IDBFactory(), legacyStorage: legacy({ projects: [], tasks: [] }) })
  assert.deepEqual(await storage.load(), { projects: [], tasks: [] })
})

test('旧数据损坏时拒绝迁移，不会用演示数据覆盖', async () => {
  const values = { [PROJECTS_KEY]: '{损坏', [TASKS_KEY]: JSON.stringify(tasks) }
  const storage = createScheduleStorage({ indexedDB: new IDBFactory(), legacyStorage: { getItem: key => values[key] } })
  await assert.rejects(storage.load(), /旧数据无法读取/)
  assert.equal(values[PROJECTS_KEY], '{损坏')
  assert.equal(values[TASKS_KEY], JSON.stringify(tasks))
})

test('新数据写入失败时仍能读取完整的原项目和需求', async () => {
  const storage = createScheduleStorage({ indexedDB: new IDBFactory(), legacyStorage: legacy({ projects, tasks }) })
  const before = await storage.load()
  await assert.rejects(storage.save({ projects: [], tasks: [{ note: () => '无法序列化的数据' }] }))
  assert.deepEqual(await storage.load(), before)
})
