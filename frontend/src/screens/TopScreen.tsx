import styles from './TopScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import shibaImg from '../assets/dog-cutouts/shiba.png'
import huskyImg from '../assets/dog-cutouts/husky.png'
import pomeranianImg from '../assets/dog-cutouts/pomeranian.png'
import toypoodleImg from '../assets/dog-cutouts/toypoodle.png'
import goldenImg from '../assets/dog-cutouts/golden.png'

interface DogPreview {
  name: string
  image: string
}

const DOG_PREVIEWS: DogPreview[] = [
  { name: '柴犬', image: shibaImg },
  { name: 'ハスキー', image: huskyImg },
  { name: 'ポメラニアン', image: pomeranianImg },
  { name: 'トイプードル', image: toypoodleImg },
  { name: 'ゴールデンレトリバー', image: goldenImg },
]

interface Props {
  onStart: () => void
  disabled: boolean
}

function TopScreen({ onStart, disabled }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>あなたをわんこに例えると？</h1>
      </div>

      <div className={styles.dogSection}>
        <div className={styles.dogSectionBg} aria-hidden="true" />

        <div className={styles.dogRow}>
          {DOG_PREVIEWS.map((dog) => (
            <div key={dog.name} className={styles.dogCard}>
              <img
                src={dog.image}
                alt={dog.name}
                className={styles.dogImage}
              />
              <p className={styles.dogName}>{dog.name}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={buttonStyles.primaryButton}
          onClick={onStart}
          disabled={disabled}
        >
          スタートだワンッ
        </button>
      </div>
    </div>
  )
}

export default TopScreen
