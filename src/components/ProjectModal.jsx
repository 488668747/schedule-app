import React, { useState } from 'react'
import Icon from './Icon'

const COLORS = ['#5578e7', '#e58a55', '#7a68c5', '#39a590', '#d96686', '#6d879d']

export default function ProjectModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName || saving) return
    setSaving(true)
    setError('')
    try { await onSave({ id: crypto.randomUUID(), name: cleanName, short: cleanName.slice(0, 2), color }) }
    catch (error) { setError(error.message) }
    finally { setSaving(false) }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
      <div className="modal-head"><div><p className="eyebrow">NEW PROJECT</p><h2 id="project-modal-title">添加项目</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><Icon name="close" size={18} /></button></div>
      <form onSubmit={submit}>
        <label className="field full"><span>项目名称</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：电商后台改版" required /></label>
        <div className="field full"><span>项目颜色</span><div className="color-picker" role="radiogroup" aria-label="项目颜色">{COLORS.map((item) => <button type="button" key={item} className={`color-option ${color === item ? 'selected' : ''}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={`选择颜色${item}`} aria-pressed={color === item}><span></span></button>)}</div></div>
        {error && <p className="editor-error" role="alert">{error}</p>}
        <div className="modal-actions"><div></div><div className="modal-actions-right"><button type="button" className="cancel-button" disabled={saving} onClick={onClose}>取消</button><button className="primary-button" type="submit" disabled={saving}>{saving ? '保存中…' : '创建项目'}</button></div></div>
      </form>
    </section>
  </div>
}
