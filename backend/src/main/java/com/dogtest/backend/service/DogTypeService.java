package com.dogtest.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.DogTypeResponse;
import com.dogtest.backend.repository.DogTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DogTypeService {

    private final DogTypeRepository dogTypeRepository;

    public List<DogTypeResponse> getAllDogTypes() {
        return dogTypeRepository.findAllByOrderByIdAsc().stream()
                .map(DogTypeResponse::from)
                .toList();
    }
}
