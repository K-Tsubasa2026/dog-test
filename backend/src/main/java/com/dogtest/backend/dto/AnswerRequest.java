package com.dogtest.backend.dto;

public record AnswerRequest(
        Long questionId,
        Long choiceId) {
}
