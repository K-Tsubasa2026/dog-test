import styles from './ResultDetail.module.css'
import RadarChart from './RadarChart'
import { DOG_IMAGES } from '../utils/dogImages'
import type { DogTypeResponse, UserScoresResponse } from '../types/diagnosis'

interface Props {
  dogType: DogTypeResponse
  // 診断していない(「自分のわんこタイプを知っている」で登録した)場合はnull
  userScores: UserScoresResponse | null
  // trueのとき、PCでは画面の高さに合わせてカードの高さを決める(結果画面用)
  fitViewport?: boolean
}

// 結果画面とマイページで共通の「左: わんこタイプ / 右: レーダーチャート+豆知識」の表示
function ResultDetail({ dogType, userScores, fitViewport = false }: Props) {
  const titleParts = dogType.title.split('、')
  const dogImage = DOG_IMAGES[dogType.code]

  return (
    <div className={fitViewport ? `${styles.layout} ${styles.fit}` : styles.layout}>
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
            <img src={dogImage} alt={dogType.name} className={styles.dogImage} />
          )}
        </div>

        <div className={styles.leftCardBottom}>
          <p className={styles.description}>{dogType.description}</p>
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.chartCard}>
          {userScores ? (
            <RadarChart scores={userScores} />
          ) : (
            <div className={styles.chartEmpty}>
              <p className={styles.chartEmptyHeading}>診断結果がありません</p>
              <p className={styles.chartEmptyText}>
                診断を受けると、ここにあなたのレーダーチャートが表示されます
              </p>
            </div>
          )}
        </div>

        <div className={styles.triviaCard}>
          <p className={styles.triviaHeading}>ちなみに...</p>
          <p className={styles.triviaText}>{dogType.trivia}</p>
        </div>
      </div>
    </div>
  )
}

export default ResultDetail
