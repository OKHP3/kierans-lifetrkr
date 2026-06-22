import type { Toast as ToastType } from '../hooks/useToast'

interface Props {
  toasts: ToastType[]
  onDismiss: (id: number) => void
}

export default function Toast({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null
  return (
    <>
      {toasts.map(t => (
        <div key={t.id} className="toast" onClick={() => onDismiss(t.id)} role="alert">
          {t.message}
        </div>
      ))}
    </>
  )
}
