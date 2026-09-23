import type { DogTypeResponse } from './diagnosis'

export interface MeResponse {
  email: string
  name: string
  // 新規登録時に「自分のわんこタイプを知っている」を選んでいなければnull
  dogType: DogTypeResponse | null
}
