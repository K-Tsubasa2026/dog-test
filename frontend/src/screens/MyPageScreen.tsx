import { useEffect, useState } from 'react'
import styles from './MyPageScreen.module.css'
import RadarChart from '../components/RadarChart'
import ScrollToTopButton from '../components/ScrollToTopButton'
import { fetchMe, fetchMyDiagnoses } from '../api/users'
import { DOG_IMAGES } from '../utils/dogImages'
import type { MeResponse } from '../types/user'
import type { DiagnosisHistoryItem } from '../types/diagnosis'

interface Props {
  onBack: () => void
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function MyPageScreen({ onBack }: Props) {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [diagnoses, setDiagnoses] = useState<DiagnosisHistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    Promise.all([fetchMe(), fetchMyDiagnoses()])
      .then(([meResponse, diagnosesResponse]) => {
        setMe(meResponse)
        setDiagnoses(diagnosesResponse)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  // 一番新しい診断結果があれば、それを「自分のわんこタイプ」として本人のレーダーチャート付きで表示する
  const latestDiagnosis = diagnoses[0]

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          TOPに戻る
        </button>
        <h1 className={styles.title}>マイページ</h1>
      </header>

      {error && <p className={styles.errorText}>{error}</p>}

      {me && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>ユーザー情報</h2>
            <p className={styles.infoLine}>ニックネーム：{me.name}</p>
            <p className={styles.infoLine}>メールアドレス：{me.email}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>自分のわんこタイプ</h2>
            {latestDiagnosis ? (
              <div className={styles.dogTypeFull}>
                <img
                  src={DOG_IMAGES[latestDiagnosis.dogType.code]}
                  alt={latestDiagnosis.dogType.name}
                  className={styles.dogImage}
                />
                <p className={styles.dogName}>{latestDiagnosis.dogType.name}タイプ</p>
                <p className={styles.dogTitle}>{latestDiagnosis.dogType.title}</p>
                <p className={styles.dogDescription}>
                  {latestDiagnosis.dogType.description}
                </p>
                <div className={styles.chartWrap}>
                  <RadarChart scores={latestDiagnosis.userScores} />
                </div>
                <p className={styles.triviaHeading}>ちなみに...</p>
                <p className={styles.triviaText}>{latestDiagnosis.dogType.trivia}</p>
              </div>
            ) : me.dogType ? (
              <div className={styles.dogTypeSimple}>
                <img
                  src={DOG_IMAGES[me.dogType.code]}
                  alt={me.dogType.name}
                  className={styles.dogImage}
                />
                <p className={styles.dogName}>{me.dogType.name}タイプ</p>
                <p className={styles.dogTitle}>{me.dogType.title}</p>
                <p className={styles.dogDescription}>{me.dogType.description}</p>
              </div>
            ) : (
              <p className={styles.emptyText}>診断履歴がありません</p>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>診断履歴</h2>
            {diagnoses.length > 0 ? (
              <ul className={styles.historyList}>
                {diagnoses.map((item) => (
                  <li key={item.id} className={styles.historyItem}>
                    <img
                      src={DOG_IMAGES[item.dogType.code]}
                      alt={item.dogType.name}
                      className={styles.historyImage}
                    />
                    <div>
                      <p className={styles.historyDogName}>
                        {item.dogType.name}タイプ
                      </p>
                      <p className={styles.historyDate}>
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>診断履歴がありません</p>
            )}
          </section>
        </>
      )}

      <ScrollToTopButton />
    </div>
  )
}

export default MyPageScreen
