import styles from './ConfirmModal.module.css'

interface Props {
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

// ログアウトなど「本当によいか確認したい操作」全般で使い回す汎用モーダル
function ConfirmModal({ message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
