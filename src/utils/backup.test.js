import test from 'node:test'
import assert from 'node:assert/strict'
import { createBackup, parseBackup } from './backup.js'
import { indexedDB } from 'fake-indexeddb'
import { createScheduleStorage } from './storage.js'

const projects = [{ id: 'p1', name: '迁移项目', short: '迁', color: '#5578e7' }]
const tasks = [{ id: 't1', projectId: 'p1', title: '跨设备需求', start: '2026-11-01', end: '2026-11-05', status: 'done', priority: 'high', note: '保留中文备注与已完成状态' }]

test('导出的备份可完整还原项目、日期、备注和已完成需求', () => {
  const restored = parseBackup(createBackup(projects, tasks))
  assert.deepEqual(restored.projects, projects)
  assert.deepEqual(restored.tasks, tasks)
  assert.equal(restored.version, 2)
  assert.ok(Number.isFinite(Date.parse(restored.exportedAt)))
})

test('允许迁移空数据及带 BOM 的备份文件', () => {
  const backup = parseBackup('\uFEFF' + createBackup([], []))
  assert.deepEqual(backup.projects, [])
  assert.deepEqual(backup.tasks, [])
})

test('拒绝损坏的 JSON、其他文件和不兼容版本', () => {
  assert.throws(() => parseBackup('{'), /JSON/)
  for (const value of [null, [], {}, { app: 'another-app' }]) {
    assert.throws(() => parseBackup(JSON.stringify(value)), /不是/)
  }
  const backup = JSON.parse(createBackup(projects, tasks))
  assert.throws(() => parseBackup(JSON.stringify({ ...backup, version: 3 })), /版本/)
  assert.throws(() => parseBackup(JSON.stringify({ ...backup, tasks: null })), /缺少/)
})

test('拒绝重复编号、缺失项目、无效日期和非法枚举', () => {
  const valid = JSON.parse(createBackup(projects, tasks))
  const cases = [
    [{ ...valid, projects: [...projects, ...projects] }, /重复的项目/],
    [{ ...valid, tasks: [...tasks, ...tasks] }, /重复的需求/],
    [{ ...valid, projects: [] }, /项目不存在/],
    [{ ...valid, projects: [{ ...projects[0], color: 'red' }] }, /颜色/],
    [{ ...valid, tasks: [{ ...tasks[0], start: '2026-02-30' }] }, /日期/],
    [{ ...valid, tasks: [{ ...tasks[0], end: '2026-10-01' }] }, /日期/],
    [{ ...valid, tasks: [{ ...tasks[0], status: 'unknown' }] }, /状态/],
    [{ ...valid, tasks: [{ ...tasks[0], priority: 'unknown' }] }, /优先级/],
    [{ ...valid, tasks: [{ ...tasks[0], note: {} }] }, /不完整/]
  ]
  for (const [backup, error] of cases) assert.throws(() => parseBackup(JSON.stringify(backup)), error)
})

test('导入时丢弃未知字段，保留应用可用的数据', () => {
  const backup = JSON.parse(createBackup(projects, tasks))
  backup.projects[0].extra = { value: 'unknown' }
  backup.tasks[0].extra = '<script>bad()</script>'
  const result = parseBackup(JSON.stringify(backup))
  assert.deepEqual(result.projects, projects)
  assert.deepEqual(result.tasks, tasks)
})

test('首次打开会把旧版本地数据迁移到 IndexedDB，重新打开仍能读到图文字段', async () => {
  const legacyStorage = new Map([
    ['rhythm-schedule-projects-v1', JSON.stringify(projects)],
    ['rhythm-schedule-tasks-v1', JSON.stringify([{ ...tasks[0], noteDoc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '图文描述' }] }] } }])]
  ])
  const legacy = { getItem: key => legacyStorage.get(key) ?? null, setItem: (key, value) => legacyStorage.set(key, value) }
  const databaseName = `rhythm-test-${Date.now()}-${Math.random()}`
  const first = createScheduleStorage({ indexedDB, legacyStorage: legacy, databaseName })
  const restored = await first.load()
  assert.equal(restored.projects[0].name, projects[0].name)
  assert.equal(restored.tasks[0].noteDoc.content[0].content[0].text, '图文描述')
  await first.save({ projects: restored.projects, tasks: [...restored.tasks, { ...tasks[0], id: 't2' }] })
  const reopened = await createScheduleStorage({ indexedDB, legacyStorage: { getItem: () => null }, databaseName }).load()
  assert.equal(reopened.tasks.length, 2)
  assert.equal(reopened.tasks[0].noteDoc.content[0].content[0].text, '图文描述')
})
