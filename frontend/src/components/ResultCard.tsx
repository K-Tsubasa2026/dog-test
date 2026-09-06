import { forwardRef } from 'react'
import styles from './ResultCard.module.css'
import RadarChart from './RadarChart'
import type { DogTypeResponse, UserScoresResponse } from '../types/diagnosis'

interface Props {
  dogType: DogTypeResponse
  userScores: UserScoresResponse
  dogImage: string | undefined
}

// 「画像として保存」専用のカード。画面幅に左右されず常に同じ見た目の
// 画像が出力されるよう、画面には表示せず固定幅でレンダリングして使う
const ResultCard = forwardRef<HTMLDivElement, Props>(function ResultCard(
  { dogType, userScores, dogImage },
  ref,
) {
  return (
    <div ref={ref} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerBg} aria-hidden="true" />
        <p className={styles.dogName}>{dogType.name}タイプ</p>
        <p className={styles.dogTitle}>{dogType.title}</p>
        {dogImage && (
          <img src={dogImage} alt={dogType.name} className={styles.dogImage} />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.descriptionCard}>
          <p className={styles.description}>{dogType.description}</p>
        </div>

        <div className={styles.chartCard}>
          <RadarChart scores={userScores} />
        </div>

        <div className={styles.triviaCard}>
          <p className={styles.triviaHeading}>ちなみに...</p>
          <p className={styles.triviaText}>{dogType.trivia}</p>
        </div>
      </div>
    </div>
  )
})

export default ResultCard
