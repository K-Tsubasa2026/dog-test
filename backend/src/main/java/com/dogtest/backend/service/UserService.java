package com.dogtest.backend.service;

import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.DogTypeResponse;
import com.dogtest.backend.dto.MeResponse;
import com.dogtest.backend.entity.User;
import com.dogtest.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // emailはJwtAuthenticationFilterがトークンから取り出し、
    // Spring Securityの認証情報として渡してくれたものを使う
    public MeResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("ユーザーが見つかりません。"));

        DogTypeResponse dogType = user.getDogType() != null
                ? DogTypeResponse.from(user.getDogType())
                : null;

        return new MeResponse(user.getEmail(), user.getName(), dogType);
    }
}
