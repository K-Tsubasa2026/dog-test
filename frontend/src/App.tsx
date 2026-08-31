import { useEffect, useState } from 'react'
import { fetchQuestions } from './api/questions'
import { postDiagnosis } from './api/diagnoses'
import DiagnosisResult from './components/DiagnosisResult'
import type { QuestionResponse } from './types/question'
import type { AnswerRequest, DiagnosisResponse } from './types/diagnosis'

function App() {
  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerRequest[]>([])
  const [result, setResult] = useState<DiagnosisResponse | null>(null)

  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .catch((err: Error) => setError(err.message))
  }, [])

  const isFinished = questions.length > 0 && currentIndex >= questions.length

  useEffect(() => {
    if (!isFinished) return
    postDiagnosis({ answers })
      .then(setResult)
      .catch((err: Error) => setError(err.message))
    // 全問回答が完了した瞬間に一度だけ送信すればよいため、依存はisFinishedのみとする
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished])

  if (error) {
    return <p>エラー: {error}</p>
  }

  if (questions.length === 0) {
    return <p>読み込み中...</p>
  }

  const handleAnswer = (questionId: number, choiceId: number) => {
    setAnswers((prev) => [...prev, { questionId, choiceId }])
    setCurrentIndex((index) => index + 1)
  }

  if (isFinished) {
    if (!result) {
      return <p>診断中...</p>
    }
    return <DiagnosisResult result={result} />
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div>
      <p>
        {currentIndex + 1} / {questions.length}
      </p>
      <h2>{currentQuestion.content}</h2>
      <div>
        {currentQuestion.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => handleAnswer(currentQuestion.id, choice.id)}
          >
            {choice.content}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
