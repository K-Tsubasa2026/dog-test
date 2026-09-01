import { useEffect, useState } from 'react'
import { fetchQuestions } from './api/questions'
import { postDiagnosis } from './api/diagnoses'
import DiagnosisResult from './components/DiagnosisResult'
import TopScreen from './screens/TopScreen'
import type { QuestionResponse } from './types/question'
import type { AnswerRequest, DiagnosisResponse } from './types/diagnosis'

type Screen = 'top' | 'question' | 'loading' | 'result'

function App() {
  const [screen, setScreen] = useState<Screen>('top')
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

  const handleStart = () => {
    setScreen('question')
  }

  const handleAnswer = (questionId: number, choiceId: number) => {
    const nextAnswers = [...answers, { questionId, choiceId }]
    setAnswers(nextAnswers)

    if (currentIndex + 1 >= questions.length) {
      setScreen('loading')
      postDiagnosis({ answers: nextAnswers })
        .then((res) => {
          setResult(res)
          setScreen('result')
        })
        .catch((err: Error) => setError(err.message))
    } else {
      setCurrentIndex((index) => index + 1)
    }
  }

  const handleRestart = () => {
    setScreen('top')
    setCurrentIndex(0)
    setAnswers([])
    setResult(null)
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

  if (screen === 'loading') {
    return <p>診断中...</p>
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
