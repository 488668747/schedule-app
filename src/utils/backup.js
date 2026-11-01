import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../data.js'

export const TASKS_KEY = 'rhythm-schedule-tasks-v1'
export const PROJECTS_KEY = 'rhythm-schedule-projects-v1'
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const hasText = (value) => typeof value === 'string' && value.trim().length > 0
const isDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function createBackup(projects, tasks) {
  return JSON.stringify({ app: 'rhythm-schedule', version: 1, exportedAt: new Date().toISOString(), projects, tasks }, null, 2)
}

export function parseBackup(text) {
  let backup
  try {
    backup = JSON.parse(text.replace(/^\uFEFF/, ''))
  } catch {
    throw new Error('文件不是有效的 JSON，请选择从“节奏”导出的备份文件。')
  }
  if (!isObject(backup) || backup.app !== 'rhythm-schedule') throw new Error('这不是“节奏”的备份文件，请重新选择。')
  if (backup.version !== 1) throw new Error('暂不支持此备份版本，请使用与备份匹配的新版应用。')
  if (!Array.isArray(backup.projects) || !Array.isArray(backup.tasks)) throw new Error('备份缺少项目或需求数据，无法导入。')
  if (typeof backup.exportedAt !== 'string' || !Number.isFinite(Date.parse(backup.exportedAt))) throw new Error('备份的导出时间无效。')

  const projectIds = new Set()
  const projects = backup.projects.map((project, index) => {
    if (!isObject(project) || !hasText(project.id) || project.id === 'all' || !hasText(project.name) || !hasText(project.short) || typeof project.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(project.color)) {
      throw new Error(`第 ${index + 1} 个项目的数据不完整或颜色无效。`)
    }
    if (projectIds.has(project.id)) throw new Error('备份中存在重复的项目编号。')
    projectIds.add(project.id)
    return { id: project.id, name: project.name, short: project.short, color: project.color }
  })

  const taskIds = new Set()
  const tasks = backup.tasks.map((task, index) => {
    if (!isObject(task) || !hasText(task.id) || !hasText(task.title) || typeof task.note !== 'string') throw new Error(`第 ${index + 1} 个需求的数据不完整。`)
    if (taskIds.has(task.id)) throw new Error('备份中存在重复的需求编号。')
    taskIds.add(task.id)
    if (!projectIds.has(task.projectId)) throw new Error(`需求“${task.title}”关联的项目不存在。`)
    if (!isDate(task.start) || !isDate(task.end) || task.start > task.end) throw new Error(`需求“${task.title}”的排期日期无效。`)
    if (!STATUS_OPTIONS.some((item) => item.id === task.status) || !PRIORITY_OPTIONS.some((item) => item.id === task.priority)) throw new Error(`需求“${task.title}”的状态或优先级无效。`)
    return { id: task.id, projectId: task.projectId, title: task.title, start: task.start, end: task.end, status: task.status, priority: task.priority, note: task.note }
  })
  return { version: 1, exportedAt: backup.exportedAt, projects, tasks }
}

// Import persists both collections before the UI changes. Undo partial writes on failure.
export function saveImportedBackup(storage, backup) {
  const entries = [[PROJECTS_KEY, JSON.stringify(backup.projects)], [TASKS_KEY, JSON.stringify(backup.tasks)]]
  let previous
  try {
    previous = entries.map(([key]) => [key, storage.getItem(key)])
  } catch {
    throw new Error('无法读取本地存储，请检查应用的存储权限。')
  }
  const written = []
  try {
    for (const [key, value] of entries) {
      storage.setItem(key, value)
      written.push(key)
    }
  } catch {
    try {
      for (const [key, value] of previous) {
        if (!written.includes(key)) continue
        if (value === null) storage.removeItem(key)
        else storage.setItem(key, value)
      }
    } catch {
      throw new Error('本地存储发生异常，导入未完成。请保留备份文件，检查存储空间后重新导入。')
    }
    throw new Error('备份保存失败，当前数据已保留。请检查本地存储空间后重试。')
  }
}

export function downloadBackup(projects, tasks) {
  const content = createBackup(projects, tasks)
  // Ensure every exported file can be imported, including the file size limit.
  parseBackup(content)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  if (blob.size > MAX_BACKUP_BYTES) throw new Error('备份超过 5 MB，暂时无法导出。')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `节奏备份-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
