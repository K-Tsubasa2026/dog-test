import { useEffect, useRef, useState } from 'react'
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

// バックエンドはUTCの時刻(末尾にZ付き)で返すため、new Date()でブラウザの時刻(日本時間)に変換される
function formatDateTime(iso: string) {
  const date = new Date(iso)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${hours}:${minutes}`
}

function MyPageScreen({ onBack }: Props) {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [diagnoses, setDiagnoses] = useState<DiagnosisHistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  // 診断履歴で選んだ結果のid。未選択(null)の間は一番新しい診断結果を表示する
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const dogTypeSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    Promise.all([fetchMe(), fetchMyDiagnoses()])
      .then(([meResponse, diagnosesResponse]) => {
        setMe(meResponse)
        setDiagnoses(diagnosesResponse)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  // 診断履歴で選んだ結果(未選択なら一番新しい結果)を、本人のレーダーチャート付きで表示する
  const latestDiagnosis = diagnoses[0]
  const selectedDiagnosis = diagnoses.find((item) => item.id === selectedId) ?? latestDiagnosis
  const isShowingLatest = selectedDiagnosis === latestDiagnosis

  // 履歴を選んだら、結果が表示される「自分のわんこタイプ」の位置までスクロールする
  const handleSelectHistory = (id: number) => {
    setSelectedId(id)
    dogTypeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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

          <section className={styles.section} ref={dogTypeSectionRef}>
            <h2 className={styles.sectionTitle}>
              {isShowingLatest ? '自分のわんこタイプ' : '過去の診断結果'}
            </h2>
            {selectedDiagnosis ? (
              <div className={styles.dogTypeFull}>
                {/* 結果画面と同じく、上(日時〜キャッチコピー)はベージュ、ギザギザの境目から下は白 */}
                <div className={styles.dogTypeFullTop}>
                  <div className={styles.dogTypeFullTopBg} aria-hidden="true" />
                  <p className={styles.diagnosedAt}>
                    {formatDateTime(selectedDiagnosis.createdAt)} の診断結果
                  </p>
                  <img
                    src={DOG_IMAGES[selectedDiagnosis.dogType.code]}
                    alt={selectedDiagnosis.dogType.name}
                    className={styles.dogImage}
                  />
                  <p className={styles.dogName}>{selectedDiagnosis.dogType.name}タイプ</p>
                  <p className={styles.dogTitle}>{selectedDiagnosis.dogType.title}</p>
                </div>
                <p className={styles.dogDescription}>
                  {selectedDiagnosis.dogType.description}
                </p>
                <div className={styles.chartWrap}>
                  <RadarChart scores={selectedDiagnosis.userScores} />
                </div>
                <p className={styles.triviaHeading}>ちなみに...</p>
                <p className={styles.triviaText}>{selectedDiagnosis.dogType.trivia}</p>
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
                  <li key={item.id}>
                    <button
                      type="button"
                      className={
                        item.id === selectedDiagnosis?.id
                          ? `${styles.historyItem} ${styles.historyItemActive}`
                          : styles.historyItem
                      }
                      aria-pressed={item.id === selectedDiagnosis?.id}
                      onClick={() => handleSelectHistory(item.id)}
                    >
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
                          {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                    </button>
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
