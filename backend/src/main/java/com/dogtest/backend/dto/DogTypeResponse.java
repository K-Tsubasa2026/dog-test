package com.dogtest.backend.dto;

import java.math.BigDecimal;

import com.dogtest.backend.entity.DogType;

public record DogTypeResponse(
        Long id,
        String code,
        String name,
        String title,
        String description,
        String trivia,
        String imageUrl,
        BigDecimal sociability,
        BigDecimal activity,
        BigDecimal independence,
        BigDecimal emotionalExpression,
        BigDecimal caution,
        BigDecimal cooperativeness) {

    // DogTypeエンティティ→DogTypeResponseへの変換は複数箇所で必要になるため、
    // ここに1つだけ用意して使い回す
    public static DogTypeResponse from(DogType dogType) {
        return new DogTypeResponse(
                dogType.getId(),
                dogType.getCode(),
                dogType.getName(),
                dogType.getTitle(),
                dogType.getDescription(),
                dogType.getTrivia(),
                dogType.getImageUrl(),
                dogType.getSociability(),
                dogType.getActivity(),
                dogType.getIndependence(),
                dogType.getEmotionalExpression(),
                dogType.getCaution(),
                dogType.getCooperativeness());
    }
}
