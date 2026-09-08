package com.dogtest.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
                // 現時点ではログインAPIを含め、まだ何も保護しない。
                // 次のステップでログインAPIを追加した後もこの状態を維持し、
                // 実際にAPIを保護するのは今後の対応にする
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}
