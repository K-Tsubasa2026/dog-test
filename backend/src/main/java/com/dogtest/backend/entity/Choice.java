package com.dogtest.backend.entity;

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

@Entity
@Table(name = "choice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Choice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private String content;

    @Column(name = "sociability_delta", nullable = false)
    private Integer sociabilityDelta;

    @Column(name = "activity_delta", nullable = false)
    private Integer activityDelta;

    @Column(name = "independence_delta", nullable = false)
    private Integer independenceDelta;

    @Column(name = "emotional_expression_delta", nullable = false)
    private Integer emotionalExpressionDelta;

    @Column(name = "caution_delta", nullable = false)
    private Integer cautionDelta;
}
