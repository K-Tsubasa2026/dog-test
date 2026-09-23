package com.dogtest.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dogtest.backend.dto.DiagnosisHistoryItemResponse;
import com.dogtest.backend.dto.MeResponse;
import com.dogtest.backend.service.DiagnosisService;
import com.dogtest.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final DiagnosisService diagnosisService;

    @GetMapping("/me")
    public MeResponse getMe(Authentication authentication) {
        String email = authentication.getName();
        return userService.getMe(email);
    }

    @GetMapping("/me/diagnoses")
    public List<DiagnosisHistoryItemResponse> getMyDiagnoses(Authentication authentication) {
        String email = authentication.getName();
        return diagnosisService.getHistory(email);
    }
}
