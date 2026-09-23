import { useEffect, useRef, useState } from 'react'
import styles from './ResultScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import RadarChart from '../components/RadarChart'
import ResultCard from '../components/ResultCard'
import RegisterModal from '../components/RegisterModal'
import Toast from '../components/Toast'
import ScrollToTopButton from '../components/ScrollToTopButton'
import { downloadElementAsPng } from '../utils/downloadImage'
import { shareResultToLine } from '../utils/lineShare'
import { DOG_IMAGES } from '../utils/dogImages'
import { getToken, saveToken } from '../utils/authToken'
import type { DiagnosisResponse } from '../types/diagnosis'

interface Props {
  result: DiagnosisResponse
  onRestart: () => void
}

function ResultScreen({ result, onRestart }: Props) {
  const { dogType, userScores } = result
  const titleParts = dogType.title.split('、')
  const dogImage = DOG_IMAGES[dogType.code]
  const resultCardRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  // 未ログインでこの結果画面に来た場合だけ「結果を登録する」を出す。
  // ログイン中に診断した結果は、診断APIの時点で既に履歴に保存済みのため不要
  const [isLoggedIn, setIsLoggedIn] = useState(() => getToken() !== null)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    // 結果画面を開いた瞬間(マウント時)は必ずページ先頭から表示する
    window.scrollTo(0, 0)
  }, [])

  const handleRegisterSuccess = (token: string) => {
    saveToken(token)
    setIsLoggedIn(true)
    setIsRegisterModalOpen(false)
    setToastMessage('登録しました。マイページから確認できます')
  }

  const handleSaveImage = () => {
    if (isSaving || !resultCardRef.current) return
    setIsSaving(true)
    downloadElementAsPng(resultCardRef.current, `dogtest-${dogType.code}.png`).finally(() =>
      setIsSaving(false),
    )
  }

  const handleShareLine = () => {
    shareResultToLine(dogType.name)
  }

  return (
    <div className={styles.container}>
      <button type="button" className={styles.backButton} onClick={onRestart}>
        TOPに戻る
      </button>

      <div className={styles.layout}>
        <div className={styles.leftCard}>
          <div className={styles.leftCardTop}>
            <div className={styles.leftCardTopBg} aria-hidden="true" />
            <p className={styles.dogName}>{dogType.name}タイプ</p>
            <p className={styles.dogTitle}>
              {titleParts.length > 1 ? (
                <>
                  {titleParts[0]}、
                  <br />
                  {titleParts.slice(1).join('、')}
                </>
              ) : (
                dogType.title
              )}
            </p>
            {dogImage && (
              <img
                src={dogImage}
                alt={dogType.name}
                className={styles.dogImage}
              />
            )}
          </div>

          <div className={styles.leftCardBottom}>
            <p className={styles.description}>{dogType.description}</p>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.chartCard}>
            <RadarChart scores={userScores} />
          </div>

          <div className={styles.triviaCard}>
            <p className={styles.triviaHeading}>ちなみに...</p>
            <p className={styles.triviaText}>{dogType.trivia}</p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={buttonStyles.outlineButton}
          onClick={handleSaveImage}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '画像として保存'}
        </button>
        <button
          type="button"
          className={buttonStyles.outlineButton}
          onClick={handleShareLine}
        >
          LINEでシェア
        </button>
        <button
          type="button"
          className={buttonStyles.outlineButton}
          onClick={onRestart}
        >
          もう一度診断する
        </button>
        {!isLoggedIn && (
          <button
            type="button"
            className={buttonStyles.outlineButton}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            結果を登録する
          </button>
        )}
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onDone={() => setToastMessage(null)} />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
          dogTypeId={dogType.id}
          userScores={userScores}
        />
      )}

      {/* 画面には表示しない画像保存専用カード。html-to-imageでの
          キャプチャ対象としてoff-screenに常時レンダリングしておく */}
      <div className={styles.offscreen} aria-hidden="true">
        <ResultCard
          ref={resultCardRef}
          dogType={dogType}
          userScores={userScores}
          dogImage={dogImage}
        />
      </div>

      <ScrollToTopButton />
    </div>
  )
}

export default ResultScreen
