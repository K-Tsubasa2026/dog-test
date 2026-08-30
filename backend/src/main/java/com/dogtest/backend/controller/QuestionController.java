package com.dogtest.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dogtest.backend.dto.QuestionResponse;
import com.dogtest.backend.service.QuestionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public List<QuestionResponse> getQuestions() {
        return questionService.getAllQuestions();
    }
}
