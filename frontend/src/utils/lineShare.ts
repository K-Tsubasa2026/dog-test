// LINE公式のシェアURLスキームで、診断結果テキスト+アプリURLを共有する。
// 結果ページ固有のURLは持たないため、共有先はアプリのトップURLになる。
// URLはVITE_APP_URLで環境ごとに切り替え、未設定時は現在のoriginにフォールバックする
export function shareResultToLine(dogName: string) {
  const shareText = `あなたをわんこに例えると？\n５つのわんこ性格診断を受けてみよう！\n診断結果: ${dogName}タイプでした！`
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`
  window.open(shareUrl, '_blank', 'noopener,noreferrer')
}
