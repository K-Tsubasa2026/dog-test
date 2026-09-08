package com.dogtest.backend.dto;

public record LoginRequest(
        String email,
        String password) {
}
