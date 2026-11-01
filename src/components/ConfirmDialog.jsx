import React from 'react'

export default function ConfirmDialog({ title, description, confirmLabel, busy, error, onClose, onConfirm }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
      <div className="confirm-content"><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p></div>
      {error && <p className="editor-error" role="alert">{error}</p>}
      <div className="confirm-actions"><button type="button" className="cancel-button" disabled={busy} onClick={onClose}>取消</button><button type="button" className="danger-button" disabled={busy} onClick={onConfirm}>{busy ? '删除中…' : confirmLabel}</button></div>
    </section>
  </div>
}
