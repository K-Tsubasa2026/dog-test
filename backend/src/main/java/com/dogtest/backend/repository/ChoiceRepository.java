package com.dogtest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dogtest.backend.entity.Choice;
import com.dogtest.backend.entity.Question;

public interface ChoiceRepository extends JpaRepository<Choice, Long> {

    List<Choice> findByQuestionInOrderByIdAsc(List<Question> questions);

    @Query("SELECT c FROM Choice c JOIN FETCH c.question WHERE c.id IN :ids")
    List<Choice> findAllWithQuestionByIdIn(@Param("ids") List<Long> ids);
}
