import { useEffect, useRef, useState } from 'react'
import styles from './QuestionScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import QuestionItem from '../components/QuestionItem'
import type { QuestionItemStatus } from '../components/QuestionItem'
import type { QuestionResponse } from '../types/question'

interface Props {
  questions: QuestionResponse[]
  answers: Record<number, number>
  onAnswer: (questionId: number, choiceId: number) => void
  onSubmit: () => void
  isSubmitting: boolean
  // 「テストを受ける」経由の時だけtrue。「テストを開始する/戻る」を先に表示する
  showStartConfirm: boolean
  onBackToChoice: () => void
}

function QuestionScreen({
  questions,
  answers,
  onAnswer,
  onSubmit,
  isSubmitting,
  showStartConfirm,
  onBackToChoice,
}: Props) {
  const [hasStarted, setHasStarted] = useState(!showStartConfirm)
  const answeredCount = Object.keys(answers).length
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length
  const currentRef = useRef<HTMLDivElement>(null)
  const prevAnsweredCount = useRef(answeredCount)

  useEffect(() => {
    // 質問画面を開いた瞬間(マウント時)は必ずQ1が見える位置から始める。
    // このuseEffectは依存配列が空なのでマウント時に1回だけ実行され、
    // 回答時のスクロール(下のuseEffect)には影響しない
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // 新しく回答して次の質問が解放されたときだけ、そこへ軽くスクロールする
    if (answeredCount > prevAnsweredCount.current) {
      currentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
    prevAnsweredCount.current = answeredCount
  }, [answeredCount])

  if (!hasStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.startConfirm}>
          <h2 className={styles.startConfirmTitle}>テストを受ける</h2>
          <div className={styles.startConfirmButtons}>
            <button
              type="button"
              className={buttonStyles.primaryButton}
              onClick={() => setHasStarted(true)}
            >
              開始する
            </button>
            <button
              type="button"
              className={buttonStyles.outlineButton}
              onClick={onBackToChoice}
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.pawPad} aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={styles.list}>
        {questions.map((question, index) => {
          let status: QuestionItemStatus
          if (index < answeredCount) {
            status = 'answered'
          } else if (index === answeredCount) {
            status = 'current'
          } else {
            status = 'locked'
          }

          return (
            <div key={question.id} ref={status === 'current' ? currentRef : null}>
              <QuestionItem
                question={question}
                index={index}
                status={status}
                selectedChoiceId={answers[question.id]}
                onAnswer={onAnswer}
              />
            </div>
          )
        })}
      </div>

      <div className={styles.submitRow}>
        <button
          type="button"
          className={buttonStyles.primaryButton}
          disabled={!allAnswered || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? '送信中...' : '診断結果を見る'}
        </button>
      </div>
    </div>
  )
}

export default QuestionScreen
