package com.dogtest.backend.dto;

import java.time.OffsetDateTime;

public record DiagnosisHistoryItemResponse(
        Long id,
        DogTypeResponse dogType,
        UserScoresResponse userScores,
        // 「UTCの時刻」であることが分かる形(例: 2026-10-10T08:50:00Z)で返し、
        // 日本時間への変換はブラウザに任せる
        OffsetDateTime createdAt) {
}
