import React, { lazy, Suspense, useEffect, useRef } from 'react'
import Icon from './Icon'
import { getPriority, getProject, getStatus } from '../data'
import { noteDocument } from '../utils/richText'
import { formatChineseDate } from '../utils/date'

const RichTextEditor = lazy(() => import('./RichTextEditor'))

export default function TaskDetails({ task, projects, onClose, onEdit }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const previous = document.activeElement
    dialog.showModal()
    return () => { dialog.close(); previous?.focus() }
  }, [])
  return <dialog ref={dialogRef} className="modal task-details" aria-labelledby="task-details-title" onCancel={onClose}>
    <div className="modal-head"><h2 id="task-details-title">{task.title}</h2><button className="icon-button" aria-label="关闭需求详情" onClick={onClose}><Icon name="close" size={18} /></button></div>
    <dl className="detail-meta"><div><dt>所属项目</dt><dd>{getProject(task.projectId, projects).name}</dd></div><div><dt>排期</dt><dd>{formatChineseDate(task.start)} — {formatChineseDate(task.end)}</dd></div><div><dt>状态</dt><dd>{getStatus(task.status).label}</dd></div><div><dt>优先级</dt><dd>{getPriority(task.priority).label}</dd></div></dl>
    <h3 className="detail-description-title">需求描述</h3>
    <Suspense fallback={<p className="rich-hint">正在加载需求描述…</p>}><RichTextEditor document={noteDocument(task)} readOnly /></Suspense>
    {!task.note && !task.noteDoc && <p className="rich-hint">暂无描述，编辑需求可补充文字与截图。</p>}
    <div className="modal-actions"><div className="modal-actions-right"><button className="cancel-button" onClick={onClose}>关闭</button><button className="primary-button" onClick={onEdit}><Icon name="edit" size={15} />编辑需求</button></div></div>
  </dialog>
}
