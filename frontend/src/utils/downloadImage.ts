import { toPng } from 'html-to-image'

// 指定したDOM要素をPNG画像として書き出し、そのままダウンロードさせる
export async function downloadElementAsPng(element: HTMLElement, fileName: string) {
  const dataUrl = await toPng(element, { pixelRatio: 2 })
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}
