package com.dogtest.backend.dto;

public record RegisterRequest(
        String email,
        String name,
        String password) {
}
