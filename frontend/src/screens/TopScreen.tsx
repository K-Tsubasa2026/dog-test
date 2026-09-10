import { useState } from 'react'
import styles from './TopScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import { DOG_PREVIEWS, type DogPreview } from '../utils/dogImages'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import ConfirmModal from '../components/ConfirmModal'
import { getToken, saveToken, clearToken } from '../utils/authToken'

interface Props {
  onStart: () => void
  disabled: boolean
}

// topScale(縮小率)からTOP画面用のtransformを組み立てる
function dogImageTransform(dog: DogPreview) {
  return dog.topScale ? `scale(${dog.topScale})` : undefined
}

function TopScreen({ onStart, disabled }: Props) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  // 前回ログインしたトークンがブラウザに残っていれば、開いた時点でログイン中扱いにする
  const [isLoggedIn, setIsLoggedIn] = useState(() => getToken() !== null)

  const handleLoginSuccess = (token: string) => {
    saveToken(token)
    setIsLoggedIn(true)
    setIsLoginModalOpen(false)
  }

  // 新規登録も成功したらそのままログイン状態にする(バックエンドの仕様に合わせている)
  const handleRegisterSuccess = (token: string) => {
    saveToken(token)
    setIsLoggedIn(true)
    setIsRegisterModalOpen(false)
  }

  const handleLogout = () => {
    clearToken()
    setIsLoggedIn(false)
    setIsLogoutConfirmOpen(false)
  }

  return (
    <div className={styles.container}>
      <nav className={styles.headerNav}>
        <button
          type="button"
          className={styles.navTextButton}
          onClick={() => setIsRegisterModalOpen(true)}
        >
          新規登録
        </button>
        <span className={styles.navTextItem}>性格タイプ</span>
        <span className={styles.navTextItem}>マイページ</span>
        {isLoggedIn ? (
          <button
            type="button"
            className={styles.navLoginButton}
            onClick={() => setIsLogoutConfirmOpen(true)}
          >
            ログアウト
          </button>
        ) : (
          <button
            type="button"
            className={styles.navLoginButton}
            onClick={() => setIsLoginModalOpen(true)}
          >
            ログイン
          </button>
        )}
      </nav>

      <div className={styles.heroSection}>
        <h1 className={styles.title}>あなたをわんこに例えると？</h1>
      </div>

      <div className={styles.dogSection}>
        <div className={styles.dogSectionBg} aria-hidden="true" />

        <div className={styles.dogRow}>
          {DOG_PREVIEWS.map((dog) => (
            <div key={dog.name} className={styles.dogCard}>
              <div className={styles.dogImageWrap}>
                <img
                  src={dog.image}
                  alt={dog.name}
                  className={styles.dogImage}
                  style={{ transform: dogImageTransform(dog) }}
                />
              </div>
              <p className={styles.dogName}>{dog.name}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={buttonStyles.primaryButton}
          onClick={onStart}
          disabled={disabled}
        >
          スタートだワンッ
        </button>
      </div>

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {isLogoutConfirmOpen && (
        <ConfirmModal
          message="本当にログアウトしてもいいですか？"
          confirmLabel="ログアウトする"
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutConfirmOpen(false)}
        />
      )}
    </div>
  )
}

export default TopScreen
