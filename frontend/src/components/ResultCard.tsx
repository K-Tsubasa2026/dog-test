import { forwardRef, type Ref } from 'react'
import styles from './ResultCard.module.css'
import RadarChart from './RadarChart'
import type { DogTypeResponse, UserScoresResponse } from '../types/diagnosis'

interface Props {
  dogType: DogTypeResponse
  userScores: UserScoresResponse
  dogImage: string | undefined
  dogImageSlotRef: Ref<HTMLDivElement>
}

// 「画像として保存」専用のカード。画面幅に左右されず常に同じ見た目の
// 画像が出力されるよう、画面には表示せず固定幅でレンダリングして使う
const ResultCard = forwardRef<HTMLDivElement, Props>(function ResultCard(
  { dogType, userScores, dogImage, dogImageSlotRef },
  ref,
) {
  return (
    <div ref={ref} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerBg} aria-hidden="true" />
        <p className={styles.dogName}>{dogType.name}タイプ</p>
        <p className={styles.dogTitle}>{dogType.title}</p>
        {/* 犬の画像はここには描かず、保存時にこの枠の位置へcanvasで直接描き込む(downloadImage.ts) */}
        {dogImage && <div ref={dogImageSlotRef} className={styles.dogImageSlot} />}
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
