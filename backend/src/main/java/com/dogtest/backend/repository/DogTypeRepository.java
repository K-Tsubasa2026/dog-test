package com.dogtest.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dogtest.backend.entity.DogType;

public interface DogTypeRepository extends JpaRepository<DogType, Long> {
}
