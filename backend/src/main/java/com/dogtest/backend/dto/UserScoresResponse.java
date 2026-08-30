package com.dogtest.backend.dto;

import java.math.BigDecimal;

public record UserScoresResponse(
        BigDecimal sociability,
        BigDecimal activity,
        BigDecimal independence,
        BigDecimal emotionalExpression,
        BigDecimal caution) {
}
