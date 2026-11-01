import { PROJECTS, seedTasks } from '../data.js'
import { createBackup, parseBackup, PROJECTS_KEY, TASKS_KEY } from './backup.js'

export const DATABASE_NAME = 'rhythm-schedule'

export function createScheduleStorage({ indexedDB, legacyStorage, databaseName = DATABASE_NAME }) {
  let database
  const open = () => {
    if (!database) database = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1)
      request.onupgradeneeded = () => request.result.createObjectStore('state')
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close()
        resolve(request.result)
      }
      request.onerror = () => reject(new Error('无法打开本地数据库，请检查存储权限后重新加载。'))
      request.onblocked = () => reject(new Error('数据库升级被其他窗口阻止，请关闭其他应用窗口后重试。'))
    })
    return database
  }
  const transaction = async (mode, action) => {
    const db = await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('state', mode)
      const request = action(tx.objectStore('state'))
      tx.oncomplete = () => resolve(request.result)
      tx.onabort = tx.onerror = () => reject(new Error('本地保存失败，数据没有更新。请检查磁盘空间或存储权限后重试。'))
    })
  }
  const save = (snapshot) => transaction('readwrite', store => store.put(snapshot, 'snapshot'))
  const load = async () => {
    const saved = await transaction('readonly', store => store.get('snapshot'))
    if (saved !== undefined) return saved
    // Keep the legacy values as a safety copy; never mirror images back into localStorage.
    let projects, tasks
    try {
      const oldProjects = legacyStorage.getItem(PROJECTS_KEY)
      const oldTasks = legacyStorage.getItem(TASKS_KEY)
      projects = oldProjects === null ? PROJECTS : JSON.parse(oldProjects)
      tasks = oldTasks === null ? seedTasks : JSON.parse(oldTasks)
      const checked = parseBackup(createBackup(projects, tasks))
      projects = checked.projects
      tasks = checked.tasks
    } catch {
      throw new Error('旧数据无法读取，已保留原数据。请先导出旧版备份或联系维护者处理。')
    }
    const snapshot = { projects, tasks }
    await save(snapshot)
    return snapshot
  }
  return { load, save }
}
