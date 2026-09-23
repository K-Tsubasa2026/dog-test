package com.dogtest.backend.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.LoginRequest;
import com.dogtest.backend.dto.LoginResponse;
import com.dogtest.backend.dto.RegisterRequest;
import com.dogtest.backend.dto.UserScoresResponse;
import com.dogtest.backend.entity.DiagnosisResult;
import com.dogtest.backend.entity.DogType;
import com.dogtest.backend.entity.User;
import com.dogtest.backend.exception.DogTypeNotFoundException;
import com.dogtest.backend.exception.DuplicateEmailException;
import com.dogtest.backend.exception.InvalidLoginException;
import com.dogtest.backend.repository.DiagnosisResultRepository;
import com.dogtest.backend.repository.DogTypeRepository;
import com.dogtest.backend.repository.UserRepository;
import com.dogtest.backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DogTypeRepository dogTypeRepository;
    private final DiagnosisResultRepository diagnosisResultRepository;
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

        // 「自分のわんこタイプを知っている」「結果を登録する」いずれかから登録した場合だけ、選んだ犬種を紐付ける
        DogType dogType = null;
        if (request.dogTypeId() != null) {
            dogType = dogTypeRepository.findById(request.dogTypeId())
                    .orElseThrow(() -> new DogTypeNotFoundException("指定された犬種が見つかりません。"));
            user.setDogType(dogType);
        }

        userRepository.save(user);

        // 診断結果画面の「結果を登録する」から登録した場合だけ、本人のスコアを診断履歴として保存する
        if (dogType != null && request.userScores() != null) {
            saveDiagnosisHistory(user, dogType, request.userScores());
        }

        // 登録後は再度ログインさせず、そのまま使えるようにトークンを発行する
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token);
    }

    // DiagnosisService.saveHistory()と同じ内容。診断結果画面から直接登録する場合は
    // ログイン前に計算済みのスコアをそのまま受け取るため、ここで保存する
    private void saveDiagnosisHistory(User user, DogType dogType, UserScoresResponse userScores) {
        DiagnosisResult result = new DiagnosisResult();
        result.setUser(user);
        result.setDogType(dogType);
        result.setSociability(userScores.sociability());
        result.setActivity(userScores.activity());
        result.setIndependence(userScores.independence());
        result.setEmotionalExpression(userScores.emotionalExpression());
        result.setCaution(userScores.caution());
        result.setCooperativeness(userScores.cooperativeness());
        result.setCreatedAt(LocalDateTime.now());
        diagnosisResultRepository.save(result);
    }
}
