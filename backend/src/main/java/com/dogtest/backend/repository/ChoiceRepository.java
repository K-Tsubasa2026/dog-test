package com.dogtest.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dogtest.backend.entity.Choice;

public interface ChoiceRepository extends JpaRepository<Choice, Long> {
}
