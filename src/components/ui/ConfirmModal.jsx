import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'مطمئنی؟',
  description,
  confirmLabel = 'تایید',
  cancelLabel = 'انصراف',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} showClose={false} className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={
            variant === 'danger'
              ? 'size-14 rounded-full bg-danger-soft text-danger flex items-center justify-center mb-4'
              : 'size-14 rounded-full bg-brand-soft text-brand flex items-center justify-center mb-4'
          }
        >
          <AlertTriangle size={26} />
        </div>
        <h3 className="text-lg font-semibold text-fg mb-1.5">{title}</h3>
        {description && (
          <p className="text-sm text-fg-secondary leading-relaxed">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 w-full mt-5">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}