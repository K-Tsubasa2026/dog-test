import { useEffect, useRef, useState } from 'react'
import styles from './ResultScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import RadarChart from '../components/RadarChart'
import ResultCard from '../components/ResultCard'
import { downloadElementAsPng } from '../utils/downloadImage'
import { shareResultToLine } from '../utils/lineShare'
import shibaImg from '../assets/dog-cutouts/shiba.png'
import huskyImg from '../assets/dog-cutouts/husky.png'
import pomeranianImg from '../assets/dog-cutouts/pomeranian.png'
import toypoodleImg from '../assets/dog-cutouts/toypoodle.png'
import goldenImg from '../assets/dog-cutouts/golden.png'
import type { DiagnosisResponse } from '../types/diagnosis'

interface Props {
  result: DiagnosisResponse
  onRestart: () => void
}

// TOP画面と同じ透過画像をdogType.codeで再利用する
const DOG_IMAGES: Record<string, string> = {
  SHIBA: shibaImg,
  HUSKY: huskyImg,
  POMERANIAN: pomeranianImg,
  TOYPOODLE: toypoodleImg,
  GOLDEN: goldenImg,
}

function ResultScreen({ result, onRestart }: Props) {
  const { dogType, userScores } = result
  const titleParts = dogType.title.split('、')
  const dogImage = DOG_IMAGES[dogType.code]
  const resultCardRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // 結果画面を開いた瞬間(マウント時)は必ずページ先頭から表示する
    window.scrollTo(0, 0)
  }, [])

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
      </div>

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
    </div>
  )
}

export default ResultScreen
