import { useState } from 'react'
import styles from './TopScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import { DOG_PREVIEWS, type DogPreview } from '../utils/dogImages'
import LoginModal from '../components/LoginModal'
import RegisterChoiceModal from '../components/RegisterChoiceModal'
import DogTypeChoiceModal from '../components/DogTypeChoiceModal'
import DogTypeConfirmModal from '../components/DogTypeConfirmModal'
import RegisterModal from '../components/RegisterModal'
import ConfirmModal from '../components/ConfirmModal'
import InfoModal from '../components/InfoModal'
import Toast from '../components/Toast'
import { getToken, saveToken, clearToken } from '../utils/authToken'
import type { DogTypeResponse } from '../types/diagnosis'

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
  const [isDogTypeChoiceOpen, setIsDogTypeChoiceOpen] = useState(false)
  const [isDogTypeConfirmOpen, setIsDogTypeConfirmOpen] = useState(false)
  const [selectedDogType, setSelectedDogType] = useState<DogTypeResponse | null>(null)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isAlreadyRegisteredOpen, setIsAlreadyRegisteredOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  // 前回ログインしたトークンがブラウザに残っていれば、開いた時点でログイン中扱いにする
  const [isLoggedIn, setIsLoggedIn] = useState(() => getToken() !== null)

  const handleLoginSuccess = (token: string) => {
    saveToken(token)
    setIsLoggedIn(true)
    setIsLoginModalOpen(false)
    setToastMessage('ログインしました')
  }

  // ログイン済みの状態で「新規登録」を押した時: 選択肢は出さず、登録済みであることだけ伝える
  const handleClickRegisterNav = () => {
    if (isLoggedIn) {
      setIsAlreadyRegisteredOpen(true)
    } else {
      setIsRegisterChoiceOpen(true)
    }
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

  // 「自分のわんこタイプを知っている」: フォーク画面を閉じて犬種選択画面へ
  const handleChooseKnown = () => {
    setIsRegisterChoiceOpen(false)
    setIsDogTypeChoiceOpen(true)
  }

  // 犬種選択の「戻る」: フォーク画面(テストを受ける/自分のわんこタイプを知っている)へ戻る
  const handleDogTypeChoiceBack = () => {
    setIsDogTypeChoiceOpen(false)
    setIsRegisterChoiceOpen(true)
  }

  // 犬種選択の「確定する」: 選んだ犬種を覚えておき、確認画面へ
  const handleDogTypeConfirmed = (dogType: DogTypeResponse) => {
    setSelectedDogType(dogType)
    setIsDogTypeChoiceOpen(false)
    setIsDogTypeConfirmOpen(true)
  }

  // 確認画面の「確定する」: 登録フォームへ
  const handleDogTypeConfirmModalConfirm = () => {
    setIsDogTypeConfirmOpen(false)
    setIsRegisterModalOpen(true)
  }

  // 確認画面の「選び直す」: 犬種選択画面へ戻る
  const handleDogTypeReselect = () => {
    setIsDogTypeConfirmOpen(false)
    setIsDogTypeChoiceOpen(true)
  }

  return (
    <div className={styles.container}>
      <nav className={styles.headerNav}>
        <button
          type="button"
          className={styles.navTextButton}
          onClick={handleClickRegisterNav}
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

      {toastMessage && (
        <Toast message={toastMessage} onDone={() => setToastMessage(null)} />
      )}

      {isAlreadyRegisteredOpen && (
        <InfoModal
          message="既に登録済みです"
          onClose={() => setIsAlreadyRegisteredOpen(false)}
        />
      )}

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

      {isDogTypeChoiceOpen && (
        <DogTypeChoiceModal
          onClose={() => setIsDogTypeChoiceOpen(false)}
          onConfirm={handleDogTypeConfirmed}
          onBack={handleDogTypeChoiceBack}
        />
      )}

      {isDogTypeConfirmOpen && selectedDogType && (
        <DogTypeConfirmModal
          dogType={selectedDogType}
          onClose={() => setIsDogTypeConfirmOpen(false)}
          onConfirm={handleDogTypeConfirmModalConfirm}
          onReselect={handleDogTypeReselect}
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
