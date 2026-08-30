package com.dogtest.backend.dto;

public record DiagnosisResponse(
        DogTypeResponse dogType,
        UserScoresResponse userScores) {
}
