package com.dogtest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dogtest.backend.entity.Choice;
import com.dogtest.backend.entity.Question;

public interface ChoiceRepository extends JpaRepository<Choice, Long> {

    List<Choice> findByQuestionInOrderByIdAsc(List<Question> questions);
}
