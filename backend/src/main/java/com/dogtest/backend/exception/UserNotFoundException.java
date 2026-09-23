package com.dogtest.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// トークンは正しく検証できたが、そのメールアドレスのユーザーがDBに存在しない場合の例外。
// (例: 開発環境でDBをリセットした後、ブラウザに古いログイン情報が残っている場合など)
// 実質的には「ログインし直してください」という状態なので401を返す
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
