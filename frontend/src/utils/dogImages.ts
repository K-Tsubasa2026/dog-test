import shibaImg from '../assets/dog-cutouts/shiba.png'
import huskyImg from '../assets/dog-cutouts/husky.png'
import pomeranianImg from '../assets/dog-cutouts/pomeranian.png'
import toypoodleImg from '../assets/dog-cutouts/toypoodle.png'
import goldenImg from '../assets/dog-cutouts/golden.png'
import chihuahuaImg from '../assets/dog-cutouts/chihuahua.png'
import frenchbullImg from '../assets/dog-cutouts/frenchbulldog.png'
import bordercollieImg from '../assets/dog-cutouts/bordercollie.png'
import beagleImg from '../assets/dog-cutouts/beagle.png'
import germanshepherdImg from '../assets/dog-cutouts/germanshepherd.png'
import dobermanImg from '../assets/dog-cutouts/doberman.png'
import samoyedImg from '../assets/dog-cutouts/samoyed.png'

export interface DogPreview {
  code: string
  name: string
  image: string
  // TOP画面の一覧表示でのみ使う見た目上の縮小率。画像データ上の
  // 縦占有率は12犬種でほぼ揃っているが、衣装や体格によって人の目には
  // 大きさが違って見えることがあるため、その見た目補正専用の値。
  // 未指定は1.0(補正なし)として扱う。ResultScreen/ResultCardには適用しない
  topScale?: number
}

// TOP画面・結果画面(通常/保存用)で共通利用する犬画像データ。
// 小型犬4種・中型犬4種・大型犬4種の順で12犬種すべてを列挙する
// (サイズ区分は表示順を決めるためだけの分類で、データ項目としては持たない)
export const DOG_PREVIEWS: DogPreview[] = [
  { code: 'POMERANIAN', name: 'ポメラニアン', image: pomeranianImg },
  { code: 'TOYPOODLE', name: 'トイプードル', image: toypoodleImg },
  { code: 'CHIHUAHUA', name: 'チワワ', image: chihuahuaImg },
  { code: 'FRENCHBULL', name: 'フレンチブルドッグ', image: frenchbullImg, topScale: 0.86 },
  { code: 'SHIBA', name: '柴犬', image: shibaImg },
  { code: 'HUSKY', name: 'ハスキー', image: huskyImg },
  { code: 'BORDERCOLLIE', name: 'ボーダーコリー', image: bordercollieImg },
  { code: 'BEAGLE', name: 'ビーグル', image: beagleImg },
  { code: 'GOLDEN', name: 'ゴールデンレトリバー', image: goldenImg },
  { code: 'GERMANSHEPHERD', name: 'ジャーマンシェパード', image: germanshepherdImg },
  { code: 'DOBERMAN', name: 'ドーベルマン', image: dobermanImg },
  { code: 'SAMOYED', name: 'サモエド', image: samoyedImg },
]

// dogType.codeから画像を引く
export const DOG_IMAGES: Record<string, string> = Object.fromEntries(
  DOG_PREVIEWS.map((dog) => [dog.code, dog.image]),
)
