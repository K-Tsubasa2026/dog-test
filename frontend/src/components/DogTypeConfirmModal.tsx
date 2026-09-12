import modalStyles from './LoginModal.module.css'
import styles from './DogTypeConfirmModal.module.css'
import buttonStyles from '../styles/Button.module.css'
import { DOG_IMAGES } from '../utils/dogImages'
import type { DogTypeResponse } from '../types/diagnosis'

interface Props {
  dogType: DogTypeResponse
  onClose: () => void
  onConfirm: () => void
  onReselect: () => void
}

function DogTypeConfirmModal({
  dogType,
  onClose,
  onConfirm,
  onReselect,
}: Props) {
  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div
        className={`${modalStyles.modal} ${styles.modal}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={modalStyles.closeButton}
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>

        <h2 className={modalStyles.title}>{dogType.name}タイプ</h2>

        <img
          src={DOG_IMAGES[dogType.code]}
          alt={dogType.name}
          className={styles.image}
        />

        <p className={styles.dogTitle}>{dogType.title}</p>
        <p className={styles.description}>{dogType.description}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${buttonStyles.primaryButton} ${modalStyles.submitButton}`}
            onClick={onConfirm}
          >
            確定する
          </button>
          <button
            type="button"
            className={`${buttonStyles.outlineButton} ${modalStyles.submitButton}`}
            onClick={onReselect}
          >
            選び直す
          </button>
        </div>
      </div>
    </div>
  )
}

export default DogTypeConfirmModal
