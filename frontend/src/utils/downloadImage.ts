import { toCanvas } from 'html-to-image'

const PIXEL_RATIO = 2

export interface ImageOverlay {
  src: string
  // 画像を描き込む位置・大きさの基準にする、カード内の空の枠要素
  slot: HTMLElement
}

// 指定したDOM要素をPNG画像として書き出し、そのままダウンロードさせる
export async function downloadElementAsPng(
  element: HTMLElement,
  fileName: string,
  overlay?: ImageOverlay,
) {
  const canvas = await toCanvas(element, { pixelRatio: PIXEL_RATIO })
  if (overlay) {
    await drawOverlay(canvas, element, overlay)
  }
  const dataUrl = canvas.toDataURL('image/png')

  // iOS Safariはdata URLのdownload属性に対応していないため、スマホ・タブレット
  // (タッチ操作が主の端末)のみ共有シート経由で保存し、PCは直接ダウンロードする
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
  if (isTouchDevice && navigator.canShare) {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], fileName, { type: 'image/png' })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
  }

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}

// iOSのWebKitでは、html-to-image(SVG経由)で描いた画像がデコード完了前に
// canvasへ描き写されて空白になるため、画像だけは読み込み完了を待って直接描き込む
async function drawOverlay(canvas: HTMLCanvasElement, element: HTMLElement, overlay: ImageOverlay) {
  const context = canvas.getContext('2d')
  if (!context) return

  const image = new Image()
  image.src = overlay.src
  await image.decode()

  const base = element.getBoundingClientRect()
  const slot = overlay.slot.getBoundingClientRect()
  // object-fit: containと同じく、縦横比を保ったまま枠の中央に収める
  const scale = Math.min(slot.width / image.naturalWidth, slot.height / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  const x = slot.left - base.left + (slot.width - width) / 2
  const y = slot.top - base.top + (slot.height - height) / 2

  context.save()
  // 画面表示のCSS drop-shadow(0 12px 18px rgba(0, 0, 0, 0.18))と同じ影
  context.shadowColor = 'rgba(0, 0, 0, 0.18)'
  context.shadowOffsetY = 12 * PIXEL_RATIO
  context.shadowBlur = 18 * PIXEL_RATIO
  context.drawImage(
    image,
    x * PIXEL_RATIO,
    y * PIXEL_RATIO,
    width * PIXEL_RATIO,
    height * PIXEL_RATIO,
  )
  context.restore()
}
