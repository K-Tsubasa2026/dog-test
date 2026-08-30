package com.dogtest.backend.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dog_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DogType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String trivia;

    @Column(name = "image_url")
    private String imageUrl;

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
}
