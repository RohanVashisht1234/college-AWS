export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="secondary-btn" onClick={onCancel}>Cancel</button>
          <button className="danger-btn" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
