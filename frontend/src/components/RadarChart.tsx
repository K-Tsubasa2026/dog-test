import styles from './RadarChart.module.css'
import type { UserScoresResponse } from '../types/diagnosis'

interface Props {
  scores: UserScoresResponse
}

const AXES: { key: keyof UserScoresResponse; label: string }[] = [
  { key: 'sociability', label: '社交性' },
  { key: 'activity', label: '行動力' },
  { key: 'independence', label: '独立性' },
  { key: 'emotionalExpression', label: '感情表現' },
  { key: 'caution', label: '警戒心' },
]

const MIN_VALUE = 1
const MAX_VALUE = 5
const SIZE = 320
const CENTER = SIZE / 2
const RADIUS = 105
const LABEL_RADIUS = RADIUS + 34

function angleForIndex(index: number) {
  return (Math.PI * 2 * index) / AXES.length - Math.PI / 2
}

function pointForValue(index: number, value: number, radius = RADIUS) {
  const angle = angleForIndex(index)
  const ratio = (value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)
  const r = radius * ratio
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  }
}

function polygonPoints(values: number[], radius = RADIUS) {
  return values
    .map((value, index) => {
      const p = pointForValue(index, value, radius)
      return `${p.x},${p.y}`
    })
    .join(' ')
}

// グリッドの目盛り(1.0〜5.0を5段階で描画)
const GRID_LEVELS = [1, 2, 3, 4, 5]

function RadarChart({ scores }: Props) {
  const dataValues = AXES.map((axis) => scores[axis.key])

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="あなたの5軸スコア"
    >
      {/* html-to-imageでのPNG化時、SVG子要素はCSSクラス経由のスタイルが
          正しく複製されずデフォルトのfill(黒)になってしまうため、
          fill/strokeはCSSクラスではなくSVG属性で直接指定する */}
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          fill="none"
          stroke="#e5ddd2"
          strokeWidth={1}
          points={polygonPoints(AXES.map(() => level))}
        />
      ))}

      {AXES.map((axis, index) => {
        const outer = pointForValue(index, MAX_VALUE)
        return (
          <line
            key={axis.key}
            stroke="#e5ddd2"
            strokeWidth={1}
            x1={CENTER}
            y1={CENTER}
            x2={outer.x}
            y2={outer.y}
          />
        )
      })}

      <polygon
        fill="#ff7a3d"
        fillOpacity={0.3}
        stroke="#ff7a3d"
        strokeWidth={2}
        strokeLinejoin="round"
        points={polygonPoints(dataValues)}
      />

      {dataValues.map((value, index) => {
        const p = pointForValue(index, value)
        return (
          <circle key={AXES[index].key} fill="#ff7a3d" cx={p.x} cy={p.y} r={4} />
        )
      })}

      {AXES.map((axis, index) => {
        const labelPoint = pointForValue(index, MAX_VALUE, LABEL_RADIUS)
        return (
          <text
            key={axis.key}
            fill="#4a2f1c"
            fontSize={13}
            fontWeight={700}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {axis.label}
            <tspan
              x={labelPoint.x}
              dy="1.3em"
              fill="#8a7663"
              fontSize={11}
              fontWeight={400}
            >
              {dataValues[index].toFixed(1)}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}

export default RadarChart
