import React, { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { downloadBackup, MAX_BACKUP_BYTES, parseBackup } from '../utils/backup'

export default function BackupModal({ projects, tasks, onClose, onImport }) {
  const dialogRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      previousFocus?.focus()
    }
  }, [])

  const exportData = () => {
    setError('')
    setMessage('')
    try {
      downloadBackup(projects, tasks)
      setMessage('已发起备份下载，请在下载列表中查看。将文件传到另一台设备后即可导入。')
    } catch (error) {
      setError(error.message)
    }
  }

  const selectFile = async (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setPreview(null)
    setMessage('')
    setError('')
    setReading(true)
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('备份文件不能超过 5 MB，请重新选择。')
      const backup = parseBackup(await file.text())
      setPreview({ ...backup, fileName: file.name })
    } catch (error) {
      setError(error.message || '文件读取失败，请重新选择。')
    } finally {
      setReading(false)
    }
  }

  const importData = () => {
    setError('')
    setMessage('')
    try {
      onImport(preview)
      setMessage(`导入完成：${preview.projects.length} 个项目、${preview.tasks.length} 个需求，已保存到这台设备。`)
      setPreview(null)
    } catch (error) {
      setError(error.message)
    }
  }

  return <dialog ref={dialogRef} className="modal backup-modal" aria-labelledby="backup-title" onCancel={onClose}>
    <div className="modal-head"><div><h2 id="backup-title">数据备份</h2><p className="backup-intro">用一份文件，把排期带到另一台设备。</p></div><button className="icon-button" onClick={onClose} aria-label="关闭数据备份"><Icon name="close" size={18} /></button></div>
    <section className="backup-section" aria-labelledby="backup-export-title">
      <h3 id="backup-export-title">导出备份</h3>
      <p>保存全部 {projects.length} 个项目、{tasks.length} 个需求，包含已完成项和备注。</p>
      <button className="outline-button" onClick={exportData}><Icon name="download" size={16} />导出 JSON 备份</button>
    </section>
    <section className="backup-section" aria-labelledby="backup-import-title">
      <h3 id="backup-import-title">导入备份</h3>
      <p>选择从“节奏”导出的 JSON 文件，确认后替换本机数据。</p>
      <label className={`outline-button backup-file-picker ${reading ? 'is-disabled' : ''}`}><Icon name="upload" size={16} />{reading ? '正在检查文件…' : '选择备份文件'}<input type="file" accept=".json,application/json" aria-label="选择备份文件" onChange={selectFile} disabled={reading} /></label>
      {preview && <div className="backup-preview">
        <p className="backup-file-name">{preview.fileName}</p>
        <div className="backup-counts"><strong>{preview.projects.length} 个项目</strong><strong>{preview.tasks.length} 个需求</strong></div>
        <p>备份时间：{new Date(preview.exportedAt).toLocaleString('zh-CN', { hour12: false })}</p>
        <p className="backup-warning">将覆盖当前 {projects.length} 个项目和 {tasks.length} 个需求，不会合并。建议先导出当前数据留作备份。</p>
        <div className="backup-preview-actions"><button className="cancel-button" onClick={() => { setPreview(null); setError('') }}>取消导入</button><button className="primary-button" onClick={importData}>导入并覆盖</button></div>
      </div>}
    </section>
    {error && <p className="backup-feedback error" role="alert">{error}</p>}
    {message && <p className="backup-feedback success" role="status">{message}</p>}
    <p className="backup-footnote">备份文件只保存在你选择的位置。设备间需要手动传送，不会自动同步。</p>
  </dialog>
}
