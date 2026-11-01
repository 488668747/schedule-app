import React from 'react'
import Icon from './Icon'

export default function ConfirmDialog({ title, description, confirmLabel, onClose, onConfirm }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
      <div className="confirm-icon"><Icon name="trash" size={20} /></div>
      <div className="confirm-content"><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p></div>
      <div className="confirm-actions"><button type="button" className="cancel-button" onClick={onClose}>取消</button><button type="button" className="danger-button" onClick={onConfirm}>{confirmLabel}</button></div>
    </section>
  </div>
}
