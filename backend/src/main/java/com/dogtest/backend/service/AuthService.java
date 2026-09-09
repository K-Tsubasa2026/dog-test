package com.dogtest.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.LoginRequest;
import com.dogtest.backend.dto.LoginResponse;
import com.dogtest.backend.entity.User;
import com.dogtest.backend.exception.InvalidLoginException;
import com.dogtest.backend.repository.UserRepository;
import com.dogtest.backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                // メールアドレスが存在しない場合とパスワードが違う場合を区別せず、
                // 同じメッセージにする(存在するメールアドレスの推測を防ぐため)
                .orElseThrow(() -> new InvalidLoginException("メールアドレスまたはパスワードが正しくありません。"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidLoginException("メールアドレスまたはパスワードが正しくありません。");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token);
    }
}
