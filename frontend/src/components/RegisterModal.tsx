import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './LoginModal.module.css'
import buttonStyles from '../styles/Button.module.css'
import { postRegister } from '../api/auth'

interface Props {
  onClose: () => void
  onRegisterSuccess: (token: string) => void
}

// 半角英数字のみ・8文字以上
const PASSWORD_PATTERN = /^[A-Za-z0-9]{8,}$/

function RegisterModal({ onClose, onRegisterSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!PASSWORD_PATTERN.test(password)) {
      setError('パスワードは8文字以上の英数字で入力してください')
      return
    }

    setError(null)
    setIsSubmitting(true)
    postRegister({ email, name, password })
      .then((response) => onRegisterSuccess(response.token))
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

        <h2 className={styles.title}>新規登録</h2>

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
            ニックネーム
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              placeholder="8文字以上の英数字のみ"
              minLength={8}
              pattern="[A-Za-z0-9]{8,}"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={`${buttonStyles.primaryButton} ${styles.submitButton}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal
