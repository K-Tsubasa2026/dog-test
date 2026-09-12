import styles from './LoginModal.module.css'
import buttonStyles from '../styles/Button.module.css'

interface Props {
  onClose: () => void
  onChooseTest: () => void
  onChooseKnown: () => void
}

function RegisterChoiceModal({ onClose, onChooseTest, onChooseKnown }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>

        <h2 className={styles.title}>新規登録</h2>

        <div className={styles.form}>
          <button
            type="button"
            className={`${buttonStyles.primaryButton} ${styles.submitButton}`}
            onClick={onChooseTest}
          >
            テストを受ける
          </button>

          <button
            type="button"
            className={`${buttonStyles.outlineButton} ${styles.submitButton}`}
            onClick={onChooseKnown}
          >
            自分のわんこタイプを知っている
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterChoiceModal
