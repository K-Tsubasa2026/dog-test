package com.dogtest.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.ChoiceResponse;
import com.dogtest.backend.dto.QuestionResponse;
import com.dogtest.backend.entity.Choice;
import com.dogtest.backend.entity.Question;
import com.dogtest.backend.repository.ChoiceRepository;
import com.dogtest.backend.repository.QuestionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ChoiceRepository choiceRepository;

    public List<QuestionResponse> getAllQuestions() {
        List<Question> questions = questionRepository.findAllByOrderByDisplayOrderAsc();
        List<Choice> choices = choiceRepository.findByQuestionInOrderByIdAsc(questions);

        Map<Long, List<Choice>> choicesByQuestionId = choices.stream()
                .collect(Collectors.groupingBy(choice -> choice.getQuestion().getId()));

        return questions.stream()
                .map(question -> toQuestionResponse(question, choicesByQuestionId.getOrDefault(question.getId(), List.of())))
                .toList();
    }

    private QuestionResponse toQuestionResponse(Question question, List<Choice> choices) {
        List<ChoiceResponse> choiceResponses = choices.stream()
                .map(choice -> new ChoiceResponse(choice.getId(), choice.getContent()))
                .toList();

        return new QuestionResponse(
                question.getId(),
                question.getContent(),
                question.getDisplayOrder(),
                choiceResponses);
    }
}
