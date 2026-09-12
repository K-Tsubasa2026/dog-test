package com.dogtest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dogtest.backend.entity.DogType;

public interface DogTypeRepository extends JpaRepository<DogType, Long> {

    List<DogType> findAllByOrderByIdAsc();
}
