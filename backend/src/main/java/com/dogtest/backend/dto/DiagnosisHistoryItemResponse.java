package com.dogtest.backend.dto;

import java.time.LocalDateTime;

public record DiagnosisHistoryItemResponse(
        Long id,
        DogTypeResponse dogType,
        UserScoresResponse userScores,
        LocalDateTime createdAt) {
}
