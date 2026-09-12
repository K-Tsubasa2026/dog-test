package com.dogtest.backend.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.LoginRequest;
import com.dogtest.backend.dto.LoginResponse;
import com.dogtest.backend.dto.RegisterRequest;
import com.dogtest.backend.entity.User;
import com.dogtest.backend.exception.DuplicateEmailException;
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

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateEmailException("このメールアドレスは既に登録されています。");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        // 登録後は再度ログインさせず、そのまま使えるようにトークンを発行する
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token);
    }
}
