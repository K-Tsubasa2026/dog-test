package com.dogtest.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ログイン中に診断を受けた時だけ、その時の結果を1件残す(誰の・いつの・何の結果か)
@Entity
@Table(name = "diagnosis_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dog_type_id", nullable = false)
    private DogType dogType;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal sociability;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal activity;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal independence;

    @Column(name = "emotional_expression", nullable = false, precision = 3, scale = 1)
    private BigDecimal emotionalExpression;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal caution;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal cooperativeness;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
