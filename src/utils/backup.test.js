import test from 'node:test'
import assert from 'node:assert/strict'
import { createBackup, parseBackup, saveImportedBackup, TASKS_KEY, PROJECTS_KEY } from './backup.js'

const projects = [{ id: 'p1', name: '迁移项目', short: '迁', color: '#5578e7' }]
const tasks = [{ id: 't1', projectId: 'p1', title: '跨设备需求', start: '2026-11-01', end: '2026-11-05', status: 'done', priority: 'high', note: '保留中文备注与已完成状态' }]

test('导出的备份可完整还原项目、日期、备注和已完成需求', () => {
  const restored = parseBackup(createBackup(projects, tasks))
  assert.deepEqual(restored.projects, projects)
  assert.deepEqual(restored.tasks, tasks)
  assert.equal(restored.version, 1)
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
  assert.throws(() => parseBackup(JSON.stringify({ ...backup, version: 2 })), /版本/)
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

function memoryStorage(entries = []) {
  const data = new Map(entries)
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) }
}

test('导入覆盖后可重新读取完整项目和需求', () => {
  const storage = memoryStorage([[PROJECTS_KEY, 'old-projects'], [TASKS_KEY, 'old-tasks']])
  saveImportedBackup(storage, parseBackup(createBackup(projects, tasks)))
  assert.deepEqual(JSON.parse(storage.getItem(PROJECTS_KEY)), projects)
  assert.deepEqual(JSON.parse(storage.getItem(TASKS_KEY)), tasks)
})

test('写入需求失败时撤销项目写入，保留两份原数据', () => {
  const storage = memoryStorage([[PROJECTS_KEY, 'old-projects'], [TASKS_KEY, 'old-tasks']])
  const setItem = storage.setItem
  storage.setItem = (key, value) => {
    if (key === TASKS_KEY) throw new Error('QuotaExceededError')
    setItem(key, value)
  }
  assert.throws(() => saveImportedBackup(storage, { projects, tasks }), /当前数据已保留/)
  assert.equal(storage.getItem(PROJECTS_KEY), 'old-projects')
  assert.equal(storage.getItem(TASKS_KEY), 'old-tasks')
})

test('首次导入失败时清理已写入的项目，避免留下半份数据', () => {
  const storage = memoryStorage()
  const setItem = storage.setItem
  storage.setItem = (key, value) => {
    if (key === TASKS_KEY) throw new Error('QuotaExceededError')
    setItem(key, value)
  }
  assert.throws(() => saveImportedBackup(storage, { projects, tasks }), /保存失败/)
  assert.equal(storage.getItem(PROJECTS_KEY), null)
  assert.equal(storage.getItem(TASKS_KEY), null)
})
