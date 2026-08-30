package com.dogtest.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dogtest.backend.dto.DiagnosisRequest;
import com.dogtest.backend.dto.DiagnosisResponse;
import com.dogtest.backend.service.DiagnosisService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/diagnoses")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @PostMapping
    public DiagnosisResponse diagnose(@RequestBody DiagnosisRequest request) {
        return diagnosisService.diagnose(request);
    }
}
