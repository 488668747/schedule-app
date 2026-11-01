import React, { lazy, Suspense, useEffect, useState } from 'react'
import Icon from './Icon'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../data'
import { noteDocument, validateRichText } from '../utils/richText'

const makeEmptyTask = (projects) => ({ title: '', projectId: projects[0]?.id || '', start: '', end: '', status: 'todo', priority: 'medium', note: '' })
const RichTextEditor = lazy(() => import('./RichTextEditor'))

export default function TaskModal({ task, projects, saving, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(task || makeEmptyTask(projects))
  const [imageBusy, setImageBusy] = useState(false)
  const [error, setError] = useState('')
  const isEditing = Boolean(task)

  useEffect(() => setForm(task || makeEmptyTask(projects)), [task, projects])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => {
    event.preventDefault()
    if (saving || imageBusy || !form.projectId || !form.title.trim() || !form.start || !form.end || form.start > form.end) return
    setError('')
    try {
      await onSave({ ...form, ...(form.noteDoc ? { noteDoc: validateRichText(form.noteDoc) } : {}), title: form.title.trim(), id: form.id || crypto.randomUUID() })
    } catch (error) { setError(error.message) }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal-head"><div><p className="eyebrow">{isEditing ? 'EDIT ITEM' : 'NEW ITEM'}</p><h2 id="task-modal-title">{isEditing ? '编辑需求' : '添加需求'}</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><Icon name="close" size={18} /></button></div>
      <form onSubmit={submit}>
        <label className="field full"><span>需求名称</span><input name="title" autoFocus value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="例如：优化登录页加载体验" required /></label>
        <div className="form-grid">
          <label className="field"><span>所属项目</span><select name="projectId" value={form.projectId} onChange={(event) => update('projectId', event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="field"><span>优先级</span><select name="priority" value={form.priority} onChange={(event) => update('priority', event.target.value)}>{PRIORITY_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <div className="form-grid">
          <label className="field"><span>开始日期</span><input name="start" type="date" value={form.start} onChange={(event) => update('start', event.target.value)} required /></label>
          <label className="field"><span>结束日期</span><input name="end" type="date" min={form.start} value={form.end} onChange={(event) => update('end', event.target.value)} required /></label>
        </div>
        <label className="field full"><span>当前状态</span><select name="status" value={form.status} onChange={(event) => update('status', event.target.value)}>{STATUS_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <div className="field full"><span>需求描述 <small>可选 · 支持图文</small></span><Suspense fallback={<p className="rich-hint">正在加载编辑器…</p>}><RichTextEditor document={noteDocument(task || makeEmptyTask(projects))} onImageBusy={setImageBusy} onChange={(noteDoc, note) => setForm(current => ({ ...current, noteDoc, note }))} /></Suspense></div>
        {!projects.length && <p className="editor-error">请先在左侧创建一个项目。</p>}
        {error && <p className="editor-error" role="alert">{error}</p>}
        <div className="modal-actions">{isEditing && <button type="button" className="delete-button" disabled={saving || imageBusy} onClick={() => onDelete(task)}>删除需求</button>}<div className="modal-actions-right"><button type="button" className="cancel-button" disabled={saving} onClick={onClose}>取消</button><button className="primary-button" type="submit" disabled={saving || imageBusy || !projects.length}>{saving ? '保存中…' : imageBusy ? '正在处理图片…' : isEditing ? '保存修改' : '添加到排期'}</button></div></div>
      </form>
    </section>
  </div>
}
