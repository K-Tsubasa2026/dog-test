package com.dogtest.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.DogTypeResponse;
import com.dogtest.backend.entity.DogType;
import com.dogtest.backend.repository.DogTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DogTypeService {

    private final DogTypeRepository dogTypeRepository;

    public List<DogTypeResponse> getAllDogTypes() {
        return dogTypeRepository.findAllByOrderByIdAsc().stream()
                .map(this::toDogTypeResponse)
                .toList();
    }

    private DogTypeResponse toDogTypeResponse(DogType dogType) {
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
