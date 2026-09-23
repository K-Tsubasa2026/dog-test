// backendの接続先はVITE_API_BASE_URLで環境ごとに切り替え、未設定時は開発用のlocalhostにフォールバックする
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
