import { useEffect, useState } from 'react'
import styles from './PersonalityTypesScreen.module.css'
import { fetchDogTypes } from '../api/dogTypes'
import { DOG_IMAGES } from '../utils/dogImages'
import type { DogTypeResponse } from '../types/diagnosis'

interface Props {
  onBack: () => void
}

interface Group {
  key: string
  label: string
  bandClass: keyof typeof styles
  codes: string[]
}

// このページだけで見た目の大きさを補正する値(TOP画面のtopScaleとは別に管理する)
const IMAGE_SCALE: Record<string, number> = {
  FRENCHBULL: 0.86,
}

function imageTransform(code: string) {
  const scale = IMAGE_SCALE[code]
  return scale ? `scale(${scale})` : undefined
}

// ResultScreenと同じく「、」で2行に分けて表示する
function renderDogTitle(title: string) {
  const parts = title.split('、')
  if (parts.length <= 1) {
    return title
  }
  return (
    <>
      {parts[0]}、
      <br />
      {parts.slice(1).join('、')}
    </>
  )
}

// 6軸データをもとに分けた4グループ(詳しい根拠は各犬の説明を参照)
const GROUPS: Group[] = [
  {
    key: 'friendly',
    label: 'フレンドリータイプ',
    bandClass: 'bandGreen',
    codes: ['GOLDEN', 'FRENCHBULL', 'SAMOYED'],
  },
  {
    key: 'moodmaker',
    label: 'ムードメーカータイプ',
    bandClass: 'bandYellow',
    codes: ['BEAGLE', 'TOYPOODLE', 'BORDERCOLLIE'],
  },
  {
    key: 'mypace',
    label: 'マイペースタイプ',
    bandClass: 'bandBlue',
    codes: ['SHIBA', 'CHIHUAHUA', 'DOBERMAN'],
  },
  {
    key: 'active',
    label: 'アクティブタイプ',
    bandClass: 'bandRed',
    codes: ['HUSKY', 'POMERANIAN', 'GERMANSHEPHERD'],
  },
]

function PersonalityTypesScreen({ onBack }: Props) {
  const [dogTypes, setDogTypes] = useState<DogTypeResponse[]>([])

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchDogTypes()
      .then(setDogTypes)
      .catch(() => {
        // 一覧の取得に失敗しても、画面自体は表示しておく
      })
  }, [])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          TOPに戻る
        </button>
        <h1 className={styles.title}>性格タイプ</h1>
      </header>

      {GROUPS.map((group, index) => {
        const dogs = group.codes
          .map((code) => dogTypes.find((dogType) => dogType.code === code))
          .filter((dogType): dogType is DogTypeResponse => dogType !== undefined)

        return (
          <section
            key={group.key}
            className={`${styles.band} ${index < GROUPS.length - 1 ? styles.bandOverlap : ''}`}
          >
            <div
              className={`${styles.bandBg} ${styles[group.bandClass]}`}
              aria-hidden="true"
            />

            <p className={styles.watermark} aria-hidden="true">
              {group.label}
            </p>

            <div className={styles.cardRow}>
              {dogs.map((dogType) => (
                <div key={dogType.code} className={styles.card}>
                  <div className={styles.imageWrap}>
                    <img
                      src={DOG_IMAGES[dogType.code]}
                      alt={dogType.name}
                      className={styles.image}
                      style={{ transform: imageTransform(dogType.code) }}
                    />
                  </div>
                  <p className={styles.name}>{dogType.name}</p>
                  <p className={styles.dogTitle}>
                    {renderDogTitle(dogType.title)}
                  </p>
                  <p className={styles.description}>{dogType.description}</p>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <button
        type="button"
        className={styles.scrollTopButton}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="画面の上部に戻る"
      >
        ↑
      </button>
    </div>
  )
}

export default PersonalityTypesScreen
