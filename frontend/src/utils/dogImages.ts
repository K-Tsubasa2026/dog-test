import shibaImg from '../assets/dog-cutouts/shiba.png'
import huskyImg from '../assets/dog-cutouts/husky.png'
import pomeranianImg from '../assets/dog-cutouts/pomeranian.png'
import toypoodleImg from '../assets/dog-cutouts/toypoodle.png'
import goldenImg from '../assets/dog-cutouts/golden.png'

export interface DogPreview {
  code: string
  name: string
  image: string
}

// TOP画面・結果画面(通常/保存用)で共通利用する犬画像データ
export const DOG_PREVIEWS: DogPreview[] = [
  { code: 'SHIBA', name: '柴犬', image: shibaImg },
  { code: 'HUSKY', name: 'ハスキー', image: huskyImg },
  { code: 'POMERANIAN', name: 'ポメラニアン', image: pomeranianImg },
  { code: 'TOYPOODLE', name: 'トイプードル', image: toypoodleImg },
  { code: 'GOLDEN', name: 'ゴールデンレトリバー', image: goldenImg },
]

export const DOG_IMAGES: Record<string, string> = Object.fromEntries(
  DOG_PREVIEWS.map((dog) => [dog.code, dog.image]),
)
