import { useEffect } from 'react'
import styles from './Toast.module.css'

interface Props {
  message: string
  onDone: () => void
}

// 「ログインしました」のように、数秒で自動的に消える画面上部のお知らせ
function Toast({ message, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500)
    return () => clearTimeout(timer)
  }, [onDone])

  return <div className={styles.toast}>{message}</div>
}

export default Toast
