package com.dogtest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dogtest.backend.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findAllByOrderByDisplayOrderAsc();
}
