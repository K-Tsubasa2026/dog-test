import { useEffect, useState } from 'react'
import { fetchQuestions } from './api/questions'
import { postDiagnosis } from './api/diagnoses'
import ResultScreen from './screens/ResultScreen'
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
  // 「テストを受ける」経由で診断画面に来た場合だけ、開始確認を表示する
  const [showStartConfirm, setShowStartConfirm] = useState(false)

  useEffect(() => {
    fetchQuestions()
      .then((fetchedQuestions) => setQuestions(shuffle(fetchedQuestions)))
      .catch((err: Error) => setError(err.message))
  }, [])

  const handleStart = () => {
    setShowStartConfirm(false)
    setScreen('question')
  }

  // 新規登録の「テストを受ける」経由: 診断画面側で開始確認を表示させる
  const handleStartFromRegister = () => {
    setShowStartConfirm(true)
    setScreen('question')
  }

  // 診断画面の開始確認で「戻る」: 何も選択していない初期状態のTOP画面へ戻る
  const handleBackToRegisterChoice = () => {
    setShowStartConfirm(false)
    setScreen('top')
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
      <TopScreen
        onStart={handleStart}
        onStartFromRegister={handleStartFromRegister}
        disabled={questions.length === 0}
      />
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
        showStartConfirm={showStartConfirm}
        onBackToChoice={handleBackToRegisterChoice}
      />
    )
  }

  if (result) {
    return <ResultScreen result={result} onRestart={handleRestart} />
  }

  return null
}

export default App
