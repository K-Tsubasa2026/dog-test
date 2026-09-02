import styles from './TopScreen.module.css'
import buttonStyles from '../styles/Button.module.css'
import shibaImg from '../assets/dog-cutouts/shiba.png'
import huskyImg from '../assets/dog-cutouts/husky.png'
import pomeranianImg from '../assets/dog-cutouts/pomeranian.png'
import toypoodleImg from '../assets/dog-cutouts/toypoodle.png'
import goldenImg from '../assets/dog-cutouts/golden.png'

interface DogPreview {
  name: string
  title: string
  image: string
}

const DOG_PREVIEWS: DogPreview[] = [
  { name: '柴犬', title: '主導権は我にあり、マイペース王', image: shibaImg },
  {
    name: 'ハスキー',
    title: '中身はおしゃべりおばさん、好奇心モンスター',
    image: huskyImg,
  },
  {
    name: 'ポメラニアン',
    title: '警戒心はSP級、小さき気高い番長',
    image: pomeranianImg,
  },
  {
    name: 'トイプードル',
    title: '気づけば懐に入り込む、みんなのアイドル',
    image: toypoodleImg,
  },
  {
    name: 'ゴールデンレトリバー',
    title: '放っておけない症候群、優しさの押し売り名人',
    image: goldenImg,
  },
]

interface Props {
  onStart: () => void
  disabled: boolean
}

function TopScreen({ onStart, disabled }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.eyebrow}>DOG PERSONALITY DIAGNOSIS</p>
      <h1 className={styles.title}>あなたをわんこに例えると？</h1>
      <p className={styles.description}>
        7割当たる、3割笑える。5つのタイプで犬あるある性格診断
      </p>

      <div className={styles.dogRow}>
        {DOG_PREVIEWS.map((dog) => {
          const [titleFirstLine, titleSecondLine] = dog.title.split('、')
          return (
            <div key={dog.name} className={styles.dogCard}>
              <img
                src={dog.image}
                alt={dog.name}
                className={styles.dogImage}
              />
              <p className={styles.dogName}>{dog.name}</p>
              <p className={styles.dogTitle}>
                {titleFirstLine}、
                <br />
                {titleSecondLine}
              </p>
            </div>
          )
        })}
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
  )
}

export default TopScreen
