package com.dogtest.backend.dto;

import java.math.BigDecimal;

public record DogTypeResponse(
        Long id,
        String code,
        String name,
        String title,
        String description,
        String trivia,
        String imageUrl,
        BigDecimal sociability,
        BigDecimal activity,
        BigDecimal independence,
        BigDecimal emotionalExpression,
        BigDecimal caution) {
}
