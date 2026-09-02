import { useEffect, useState } from 'react'
import { fetchQuestions } from './api/questions'
import { postDiagnosis } from './api/diagnoses'
import DiagnosisResult from './components/DiagnosisResult'
import TopScreen from './screens/TopScreen'
import QuestionScreen from './screens/QuestionScreen'
import { shuffle } from './utils/shuffle'
import type { QuestionResponse } from './types/question'
import type { DiagnosisResponse } from './types/diagnosis'

type Screen = 'top' | 'question' | 'result'

// questionId -> choiceId の辞書。回答済み質問数と現在位置はこの辞書のキー数から導出する
type AnswersMap = Record<number, number>

function App() {
  const [screen, setScreen] = useState<Screen>('top')
  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<AnswersMap>({})
  const [result, setResult] = useState<DiagnosisResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestions()
      .then((fetchedQuestions) => setQuestions(shuffle(fetchedQuestions)))
      .catch((err: Error) => setError(err.message))
  }, [])

  const handleStart = () => {
    setScreen('question')
  }

  const handleAnswer = (questionId: number, choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  const handleSubmit = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    const answerList = questions.map((question) => ({
      questionId: question.id,
      choiceId: answers[question.id],
    }))
    postDiagnosis({ answers: answerList })
      .then((res) => {
        setResult(res)
        setScreen('result')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSubmitting(false))
  }

  const handleRestart = () => {
    setScreen('top')
    setAnswers({})
    setResult(null)
    setQuestions((prev) => shuffle(prev))
  }

  if (error) {
    return <p>エラー: {error}</p>
  }

  if (screen === 'top') {
    return (
      <TopScreen onStart={handleStart} disabled={questions.length === 0} />
    )
  }

  if (screen === 'question') {
    return (
      <QuestionScreen
        questions={questions}
        answers={answers}
        onAnswer={handleAnswer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    )
  }

  if (result) {
    return (
      <div>
        <DiagnosisResult result={result} />
        <button type="button" onClick={handleRestart}>
          もう一度診断する
        </button>
      </div>
    )
  }

  return null
}

export default App
