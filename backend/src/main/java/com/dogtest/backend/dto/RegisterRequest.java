package com.dogtest.backend.dto;

public record RegisterRequest(
        String email,
        String name,
        String password,
        // 「自分のわんこタイプを知っている」から登録した場合だけ値が入る(それ以外はnull)
        Long dogTypeId,
        // 診断結果画面の「結果を登録する」から登録した場合だけ値が入る(それ以外はnull)。
        // 入っている場合は診断履歴としても保存する
        UserScoresResponse userScores) {
}
