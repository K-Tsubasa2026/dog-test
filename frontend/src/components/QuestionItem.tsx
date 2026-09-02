import styles from './QuestionItem.module.css'
import type { QuestionResponse } from '../types/question'

export type QuestionItemStatus = 'answered' | 'current' | 'locked'

interface Props {
  question: QuestionResponse
  index: number
  status: QuestionItemStatus
  selectedChoiceId?: number
  onAnswer: (questionId: number, choiceId: number) => void
}

function QuestionItem({
  question,
  index,
  status,
  selectedChoiceId,
  onAnswer,
}: Props) {
  const isInteractive = status !== 'locked'

  return (
    <div
      className={`${styles.item} ${styles[status]}`}
      aria-current={status === 'current' ? 'step' : undefined}
      aria-hidden={status === 'locked'}
    >
      <div className={styles.row}>
        <div className={styles.textGroup}>
          <p className={styles.number}>Q{index + 1}</p>
          <p className={styles.questionText}>{question.content}</p>
        </div>
        <div className={styles.choices}>
          {question.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className={`${styles.answerButton} ${
                selectedChoiceId === choice.id ? styles.selected : ''
              }`}
              disabled={!isInteractive}
              tabIndex={isInteractive ? 0 : -1}
              onClick={() => onAnswer(question.id, choice.id)}
            >
              {choice.content}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuestionItem
