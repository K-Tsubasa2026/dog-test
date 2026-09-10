import { useState } from 'react'
import styles from './TopScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import { DOG_PREVIEWS, type DogPreview } from '../utils/dogImages'
import LoginModal from '../components/LoginModal'
import RegisterChoiceModal from '../components/RegisterChoiceModal'
import RegisterModal from '../components/RegisterModal'
import ConfirmModal from '../components/ConfirmModal'
import { getToken, saveToken, clearToken } from '../utils/authToken'

interface Props {
  onStart: () => void
  onStartFromRegister: () => void
  disabled: boolean
}

// topScale(縮小率)からTOP画面用のtransformを組み立てる
function dogImageTransform(dog: DogPreview) {
  return dog.topScale ? `scale(${dog.topScale})` : undefined
}

function TopScreen({ onStart, onStartFromRegister, disabled }: Props) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterChoiceOpen, setIsRegisterChoiceOpen] = useState(false)
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

  // 「テストを受ける」: フォーク画面を閉じて診断画面へ(開始確認は診断画面側で表示する)
  const handleChooseTest = () => {
    setIsRegisterChoiceOpen(false)
    onStartFromRegister()
  }

  // 「自分のわんこタイプを知っている」: フォーク画面を閉じて登録フォームへ
  const handleChooseKnown = () => {
    setIsRegisterChoiceOpen(false)
    setIsRegisterModalOpen(true)
  }

  return (
    <div className={styles.container}>
      <nav className={styles.headerNav}>
        <button
          type="button"
          className={styles.navTextButton}
          onClick={() => setIsRegisterChoiceOpen(true)}
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

      {isRegisterChoiceOpen && (
        <RegisterChoiceModal
          onClose={() => setIsRegisterChoiceOpen(false)}
          onChooseTest={handleChooseTest}
          onChooseKnown={handleChooseKnown}
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
