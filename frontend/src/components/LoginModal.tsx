import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './LoginModal.module.css'
import buttonStyles from '../styles/Button.module.css'
import { postLogin } from '../api/auth'

interface Props {
  onClose: () => void
  onLoginSuccess: (token: string) => void
}

function LoginModal({ onClose, onLoginSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)
    postLogin({ email, password })
      .then((response) => onLoginSuccess(response.token))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSubmitting(false))
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

        <h2 className={styles.title}>ログイン</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            メールアドレス
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            パスワード
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={`${buttonStyles.primaryButton} ${styles.submitButton}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
