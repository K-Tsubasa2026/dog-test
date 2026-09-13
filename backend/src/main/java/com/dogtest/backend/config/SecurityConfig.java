package com.dogtest.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.dogtest.backend.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // パスワードを暗号化(ハッシュ化)するための部品。
    // 平文の"password123"と、DBに保存されたハッシュ値を比較する時にも使う
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // JWT(トークン)方式の認証にはCookieを使わないため、
                // Cookie前提のCSRF対策は今回不要なので無効化する
                .csrf(csrf -> csrf.disable())
                // 既存のCorsConfig(WebMvcConfigurer)の設定をSpring Securityにも適用する
                .cors(Customizer.withDefaults())
                // /api/users/以下だけログイン必須にし、それ以外は今まで通り誰でも使える
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/**").authenticated()
                        .anyRequest().permitAll())
                // JWTを読み取ってログイン中かどうかを判定するフィルターを追加する
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
