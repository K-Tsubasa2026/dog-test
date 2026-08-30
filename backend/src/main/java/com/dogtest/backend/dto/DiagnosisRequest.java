package com.dogtest.backend.dto;

import java.util.List;

public record DiagnosisRequest(
        List<AnswerRequest> answers) {
}
