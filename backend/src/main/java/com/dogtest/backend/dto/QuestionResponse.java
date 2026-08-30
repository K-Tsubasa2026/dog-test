package com.dogtest.backend.dto;

import java.util.List;

public record QuestionResponse(
        Long id,
        String content,
        Integer displayOrder,
        List<ChoiceResponse> choices) {
}
