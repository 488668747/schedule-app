import React, { useEffect, useState } from 'react'
import Icon from './Icon'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../data'

const makeEmptyTask = (projects) => ({ title: '', projectId: projects[0]?.id || '', start: '', end: '', status: 'todo', priority: 'medium', note: '' })

export default function TaskModal({ task, projects, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(task || makeEmptyTask(projects))
  const isEditing = Boolean(task)

  useEffect(() => setForm(task || makeEmptyTask(projects)), [task, projects])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.start || !form.end) return
    onSave({ ...form, title: form.title.trim(), id: form.id || `task-${Date.now()}` })
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal-head"><div><p className="eyebrow">{isEditing ? 'EDIT ITEM' : 'NEW ITEM'}</p><h2 id="task-modal-title">{isEditing ? '编辑需求' : '添加需求'}</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><Icon name="close" size={18} /></button></div>
      <form onSubmit={submit}>
        <label className="field full"><span>需求名称</span><input autoFocus value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="例如：优化登录页加载体验" required /></label>
        <div className="form-grid">
          <label className="field"><span>所属项目</span><select value={form.projectId} onChange={(event) => update('projectId', event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="field"><span>优先级</span><select value={form.priority} onChange={(event) => update('priority', event.target.value)}>{PRIORITY_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <div className="form-grid">
          <label className="field"><span>开始日期</span><input type="date" value={form.start} onChange={(event) => update('start', event.target.value)} required /></label>
          <label className="field"><span>结束日期</span><input type="date" min={form.start} value={form.end} onChange={(event) => update('end', event.target.value)} required /></label>
        </div>
        <label className="field full"><span>当前状态</span><select value={form.status} onChange={(event) => update('status', event.target.value)}>{STATUS_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="field full"><span>备注 <small>可选</small></span><textarea value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="写下依赖、交付物或下一步..." rows="3" /></label>
        <div className="modal-actions">{isEditing && <button type="button" className="delete-button" onClick={() => onDelete(task)}>删除需求</button>}<div className="modal-actions-right"><button type="button" className="cancel-button" onClick={onClose}>取消</button><button className="primary-button" type="submit">{isEditing ? '保存修改' : '添加到排期'}</button></div></div>
      </form>
    </section>
  </div>
}
