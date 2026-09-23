package com.dogtest.backend.dto;

public record MeResponse(
        String email,
        String name,
        // 新規登録時に「自分のわんこタイプを知っている」を選んでいない場合はnull
        DogTypeResponse dogType) {
}
