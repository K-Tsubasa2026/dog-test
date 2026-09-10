package com.dogtest.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dogtest.backend.dto.DogTypeResponse;
import com.dogtest.backend.service.DogTypeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dog-types")
@RequiredArgsConstructor
public class DogTypeController {

    private final DogTypeService dogTypeService;

    @GetMapping
    public List<DogTypeResponse> getDogTypes() {
        return dogTypeService.getAllDogTypes();
    }
}
