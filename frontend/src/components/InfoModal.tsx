import styles from './ConfirmModal.module.css'

interface Props {
  message: string
  onClose: () => void
}

// 「お知らせして閉じるだけ」の操作全般で使い回す汎用モーダル
function InfoModal({ message, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoModal
