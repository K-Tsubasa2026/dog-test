import styles from './ScrollToTopButton.module.css'

// 全画面共通の「画面の一番上に戻る」ボタン。右下に常時表示する
function ScrollToTopButton() {
  return (
    <button
      type="button"
      className={styles.scrollTopButton}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="画面の上部に戻る"
    >
      ↑
    </button>
  )
}

export default ScrollToTopButton
