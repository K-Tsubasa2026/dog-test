import { useEffect, useState } from 'react'
import styles from './DogTypeChoiceModal.module.css'
import buttonStyles from '../styles/Button.module.css'
import { fetchDogTypes } from '../api/dogTypes'
import { DOG_IMAGES } from '../utils/dogImages'
import type { DogTypeResponse } from '../types/diagnosis'

interface Props {
  onClose: () => void
  onConfirm: (dogType: DogTypeResponse) => void
  onBack: () => void
}

function DogTypeChoiceModal({ onClose, onConfirm, onBack }: Props) {
  const [dogTypes, setDogTypes] = useState<DogTypeResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    fetchDogTypes()
      .then(setDogTypes)
      .catch((err: Error) => setError(err.message))
  }, [])

  const selectedDogType = dogTypes.find((dogType) => dogType.id === selectedId)

  const handleConfirm = () => {
    if (selectedDogType) {
      onConfirm(selectedDogType)
    }
  }

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

        <h2 className={styles.title}>自分のわんこタイプを選んでください</h2>

        {error && <p>{error}</p>}

        <div className={styles.grid}>
          {dogTypes.map((dogType) => (
            <button
              key={dogType.id}
              type="button"
              className={`${styles.card} ${selectedId === dogType.id ? styles.cardSelected : ''}`}
              onClick={() => setSelectedId(dogType.id)}
            >
              <div className={styles.imageWrap}>
                <img
                  src={DOG_IMAGES[dogType.code]}
                  alt={dogType.name}
                  className={styles.image}
                />
              </div>
              <p className={styles.name}>{dogType.name}</p>
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={buttonStyles.primaryButton}
            onClick={handleConfirm}
            disabled={!selectedDogType}
          >
            確定する
          </button>
          <button
            type="button"
            className={buttonStyles.outlineButton}
            onClick={onBack}
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  )
}

export default DogTypeChoiceModal
