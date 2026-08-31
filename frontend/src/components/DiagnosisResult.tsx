import { API_BASE_URL } from '../api/config'
import type { DiagnosisResponse } from '../types/diagnosis'

interface Props {
  result: DiagnosisResponse
}

function DiagnosisResult({ result }: Props) {
  const { dogType, userScores } = result

  return (
    <div>
      <h2>{dogType.name}</h2>
      <p>{dogType.title}</p>
      {dogType.imageUrl && (
        <img
          src={`${API_BASE_URL}${dogType.imageUrl}`}
          alt={dogType.name}
          width={200}
        />
      )}
      <p>{dogType.description}</p>
      <p>{dogType.trivia}</p>
      <h3>あなたの5軸スコア</h3>
      <ul>
        <li>社交性: {userScores.sociability}</li>
        <li>行動力: {userScores.activity}</li>
        <li>独立性: {userScores.independence}</li>
        <li>感情表現: {userScores.emotionalExpression}</li>
        <li>警戒心: {userScores.caution}</li>
      </ul>
    </div>
  )
}

export default DiagnosisResult
