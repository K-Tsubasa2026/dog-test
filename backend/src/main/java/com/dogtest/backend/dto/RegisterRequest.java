package com.dogtest.backend.dto;

public record RegisterRequest(
        String email,
        String name,
        String password,
        // 「自分のわんこタイプを知っている」から登録した場合だけ値が入る(それ以外はnull)
        Long dogTypeId) {
}
