package com.dogtest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dogtest.backend.entity.DiagnosisResult;

public interface DiagnosisResultRepository extends JpaRepository<DiagnosisResult, Long> {

    List<DiagnosisResult> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
