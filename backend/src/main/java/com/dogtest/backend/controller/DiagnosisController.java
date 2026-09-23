package com.dogtest.backend.controller;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
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

    // このAPI自体は未ログインでも使えるままにしたいので、
    // ログイン中かどうかをここで判定し、ログイン中の時だけメールアドレスを渡す
    @PostMapping
    public DiagnosisResponse diagnose(@RequestBody DiagnosisRequest request, Authentication authentication) {
        String userEmail = isLoggedIn(authentication) ? authentication.getName() : null;
        return diagnosisService.diagnose(request, userEmail);
    }

    private boolean isLoggedIn(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }
}
