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

// TOP画面・結果画面(通常/保存用)で共通利用する犬画像データ。
// 12犬種のうち、画像アセット(frontend/src/assets/dog-cutouts/*.png)が
// 用意できている犬種のみを列挙する。未用意の犬種は、対応する透過PNGが
// 揃い次第ここに追記する(必要なファイル名はコメントを参照)。
export const DOG_PREVIEWS: DogPreview[] = [
  { code: 'POMERANIAN', name: 'ポメラニアン', image: pomeranianImg },
  { code: 'TOYPOODLE', name: 'トイプードル', image: toypoodleImg },
  // { code: 'CHIHUAHUA', name: 'チワワ', image: 要 assets/dog-cutouts/chihuahua.png }
  // { code: 'FRENCHBULL', name: 'フレンチブルドッグ', image: 要 assets/dog-cutouts/frenchbulldog.png }
  { code: 'SHIBA', name: '柴犬', image: shibaImg },
  { code: 'HUSKY', name: 'ハスキー', image: huskyImg },
  // { code: 'BORDERCOLLIE', name: 'ボーダーコリー', image: 要 assets/dog-cutouts/bordercollie.png }
  // { code: 'BEAGLE', name: 'ビーグル', image: 要 assets/dog-cutouts/beagle.png }
  { code: 'GOLDEN', name: 'ゴールデンレトリバー', image: goldenImg },
  // { code: 'GERMANSHEPHERD', name: 'ジャーマンシェパード', image: 要 assets/dog-cutouts/germanshepherd.png }
  // { code: 'DOBERMAN', name: 'ドーベルマン', image: 要 assets/dog-cutouts/doberman.png }
  // { code: 'SAMOYED', name: 'サモエド', image: 要 assets/dog-cutouts/samoyed.png }
]

// dogType.codeから画像を引く。画像未用意の犬種はundefinedを返し、
// 呼び出し側の `{dogImage && <img ... />}` により画像なしで表示される
export const DOG_IMAGES: Record<string, string> = Object.fromEntries(
  DOG_PREVIEWS.map((dog) => [dog.code, dog.image]),
)
