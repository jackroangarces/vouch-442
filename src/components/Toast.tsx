import React, { useEffect } from 'react'

type Props = {
  message: string
  visible: boolean
  onClose?: () => void
  duration?: number
}

export default function Toast({ message, visible, onClose, duration = 2000 }: Props) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => onClose && onClose(), duration)
    return () => clearTimeout(t)
  }, [visible, duration, onClose])

  if (!visible) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      <div className="toast-inner">{message}</div>
    </div>
  )
}
