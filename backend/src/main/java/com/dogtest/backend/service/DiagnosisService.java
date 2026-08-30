package com.dogtest.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.dogtest.backend.dto.AnswerRequest;
import com.dogtest.backend.dto.DiagnosisRequest;
import com.dogtest.backend.dto.DiagnosisResponse;
import com.dogtest.backend.dto.DogTypeResponse;
import com.dogtest.backend.dto.UserScoresResponse;
import com.dogtest.backend.entity.Choice;
import com.dogtest.backend.entity.DogType;
import com.dogtest.backend.entity.Question;
import com.dogtest.backend.exception.InvalidDiagnosisRequestException;
import com.dogtest.backend.exception.InvalidQuestionSetException;
import com.dogtest.backend.repository.ChoiceRepository;
import com.dogtest.backend.repository.DogTypeRepository;
import com.dogtest.backend.repository.QuestionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private static final BigDecimal SCALE_MIN = BigDecimal.valueOf(1.0);
    private static final BigDecimal SCALE_MAX = BigDecimal.valueOf(5.0);

    private final QuestionRepository questionRepository;
    private final ChoiceRepository choiceRepository;
    private final DogTypeRepository dogTypeRepository;

    public DiagnosisResponse diagnose(DiagnosisRequest request) {
        List<Choice> answeredChoices = resolveAndValidateChoices(request.answers());

        RawScores rawScores = aggregateRawScores(answeredChoices);
        ScoreRange theoreticalRange = calculateTheoreticalRange();
        UserScoresResponse userScores = normalize(rawScores, theoreticalRange);

        DogType closestDogType = findClosestDogType(userScores);

        return new DiagnosisResponse(toDogTypeResponse(closestDogType), userScores);
    }

    private List<Choice> resolveAndValidateChoices(List<AnswerRequest> answers) {
        if (answers == null || answers.isEmpty()) {
            throw new InvalidDiagnosisRequestException("回答が1件も含まれていません。");
        }

        List<Long> choiceIds = answers.stream()
                .map(AnswerRequest::choiceId)
                .toList();

        Map<Long, Choice> choiceById = choiceRepository.findAllWithQuestionByIdIn(choiceIds).stream()
                .collect(Collectors.toMap(Choice::getId, choice -> choice));

        for (AnswerRequest answer : answers) {
            Choice choice = choiceById.get(answer.choiceId());
            if (choice == null) {
                throw new InvalidDiagnosisRequestException(
                        "choiceId=" + answer.choiceId() + " は存在しません。");
            }
            if (!choice.getQuestion().getId().equals(answer.questionId())) {
                throw new InvalidDiagnosisRequestException(
                        "choiceId=" + answer.choiceId() + " は questionId=" + answer.questionId() + " の選択肢ではありません。");
            }
        }

        return choiceIds.stream()
                .map(choiceById::get)
                .toList();
    }

    private RawScores aggregateRawScores(List<Choice> choices) {
        int sociability = 0;
        int activity = 0;
        int independence = 0;
        int emotionalExpression = 0;
        int caution = 0;

        for (Choice choice : choices) {
            sociability += choice.getSociabilityDelta();
            activity += choice.getActivityDelta();
            independence += choice.getIndependenceDelta();
            emotionalExpression += choice.getEmotionalExpressionDelta();
            caution += choice.getCautionDelta();
        }

        return new RawScores(sociability, activity, independence, emotionalExpression, caution);
    }

    private ScoreRange calculateTheoreticalRange() {
        List<Question> questions = questionRepository.findAllByOrderByDisplayOrderAsc();
        Map<Long, List<Choice>> choicesByQuestionId = choiceRepository.findByQuestionInOrderByIdAsc(questions).stream()
                .collect(Collectors.groupingBy(choice -> choice.getQuestion().getId()));

        int minSociability = 0, maxSociability = 0;
        int minActivity = 0, maxActivity = 0;
        int minIndependence = 0, maxIndependence = 0;
        int minEmotionalExpression = 0, maxEmotionalExpression = 0;
        int minCaution = 0, maxCaution = 0;

        for (Question question : questions) {
            List<Choice> questionChoices = choicesByQuestionId.getOrDefault(question.getId(), List.of());

            minSociability += minDelta(questionChoices, Choice::getSociabilityDelta);
            maxSociability += maxDelta(questionChoices, Choice::getSociabilityDelta);

            minActivity += minDelta(questionChoices, Choice::getActivityDelta);
            maxActivity += maxDelta(questionChoices, Choice::getActivityDelta);

            minIndependence += minDelta(questionChoices, Choice::getIndependenceDelta);
            maxIndependence += maxDelta(questionChoices, Choice::getIndependenceDelta);

            minEmotionalExpression += minDelta(questionChoices, Choice::getEmotionalExpressionDelta);
            maxEmotionalExpression += maxDelta(questionChoices, Choice::getEmotionalExpressionDelta);

            minCaution += minDelta(questionChoices, Choice::getCautionDelta);
            maxCaution += maxDelta(questionChoices, Choice::getCautionDelta);
        }

        return new ScoreRange(
                minSociability, maxSociability,
                minActivity, maxActivity,
                minIndependence, maxIndependence,
                minEmotionalExpression, maxEmotionalExpression,
                minCaution, maxCaution);
    }

    private int minDelta(List<Choice> choices, ToIntFunction<Choice> extractor) {
        return choices.stream().mapToInt(extractor).min().orElse(0);
    }

    private int maxDelta(List<Choice> choices, ToIntFunction<Choice> extractor) {
        return choices.stream().mapToInt(extractor).max().orElse(0);
    }

    private UserScoresResponse normalize(RawScores raw, ScoreRange range) {
        return new UserScoresResponse(
                normalizeAxis(raw.sociability(), range.minSociability(), range.maxSociability()),
                normalizeAxis(raw.activity(), range.minActivity(), range.maxActivity()),
                normalizeAxis(raw.independence(), range.minIndependence(), range.maxIndependence()),
                normalizeAxis(raw.emotionalExpression(), range.minEmotionalExpression(), range.maxEmotionalExpression()),
                normalizeAxis(raw.caution(), range.minCaution(), range.maxCaution()));
    }

    private BigDecimal normalizeAxis(int raw, int theoreticalMin, int theoreticalMax) {
        int span = theoreticalMax - theoreticalMin;
        if (span <= 0) {
            throw new InvalidQuestionSetException(
                    "理論範囲が不正です（min=" + theoreticalMin + ", max=" + theoreticalMax
                            + "）。この軸に影響する質問・選択肢の設定を見直してください。");
        }

        BigDecimal ratio = BigDecimal.valueOf(raw - theoreticalMin)
                .divide(BigDecimal.valueOf(span), 10, RoundingMode.HALF_UP);

        return SCALE_MIN.add(ratio.multiply(SCALE_MAX.subtract(SCALE_MIN)))
                .setScale(1, RoundingMode.HALF_UP);
    }

    private DogType findClosestDogType(UserScoresResponse userScores) {
        List<DogType> dogTypes = dogTypeRepository.findAll();
        if (dogTypes.isEmpty()) {
            throw new InvalidQuestionSetException("DogTypeが1件も登録されていません。");
        }

        DogType closest = null;
        double minDistance = Double.MAX_VALUE;

        for (DogType dogType : dogTypes) {
            double distance = euclideanDistance(userScores, dogType);
            if (distance < minDistance) {
                minDistance = distance;
                closest = dogType;
            }
        }

        return closest;
    }

    private double euclideanDistance(UserScoresResponse userScores, DogType dogType) {
        double dSociability = userScores.sociability().doubleValue() - dogType.getSociability().doubleValue();
        double dActivity = userScores.activity().doubleValue() - dogType.getActivity().doubleValue();
        double dIndependence = userScores.independence().doubleValue() - dogType.getIndependence().doubleValue();
        double dEmotionalExpression = userScores.emotionalExpression().doubleValue()
                - dogType.getEmotionalExpression().doubleValue();
        double dCaution = userScores.caution().doubleValue() - dogType.getCaution().doubleValue();

        return Math.sqrt(
                dSociability * dSociability
                        + dActivity * dActivity
                        + dIndependence * dIndependence
                        + dEmotionalExpression * dEmotionalExpression
                        + dCaution * dCaution);
    }

    private DogTypeResponse toDogTypeResponse(DogType dogType) {
        return new DogTypeResponse(
                dogType.getId(),
                dogType.getCode(),
                dogType.getName(),
                dogType.getTitle(),
                dogType.getDescription(),
                dogType.getTrivia(),
                dogType.getImageUrl(),
                dogType.getSociability(),
                dogType.getActivity(),
                dogType.getIndependence(),
                dogType.getEmotionalExpression(),
                dogType.getCaution());
    }

    private record RawScores(
            int sociability,
            int activity,
            int independence,
            int emotionalExpression,
            int caution) {
    }

    private record ScoreRange(
            int minSociability, int maxSociability,
            int minActivity, int maxActivity,
            int minIndependence, int maxIndependence,
            int minEmotionalExpression, int maxEmotionalExpression,
            int minCaution, int maxCaution) {
    }
}
