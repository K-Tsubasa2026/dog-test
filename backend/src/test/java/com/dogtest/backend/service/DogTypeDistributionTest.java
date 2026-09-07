package com.dogtest.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.dogtest.backend.dto.AnswerRequest;
import com.dogtest.backend.dto.DiagnosisRequest;
import com.dogtest.backend.dto.DiagnosisResponse;
import com.dogtest.backend.entity.Choice;
import com.dogtest.backend.entity.DogType;
import com.dogtest.backend.entity.Question;
import com.dogtest.backend.repository.ChoiceRepository;
import com.dogtest.backend.repository.DogTypeRepository;
import com.dogtest.backend.repository.QuestionRepository;

/**
 * 12犬種・6軸の判定分布が「回帰的に」極端な偏りを生んでいないかを検証する。
 *
 * 各軸(重要質問2問±2・通常質問3問±1)の全YES/NOパターン(2^5=32通り)から、
 * 生スコアが取りうる8値それぞれの出現回数(重み)を厳密に数え上げ、
 * 6軸のデカルト積(8^6=262,144通り)を回答パターン重み付きで全数検証する。
 * ランダムサンプリングではなく理論上完全な分布計算になる。
 *
 * data.sqlのプロフィール値を変更した際、この閾値(5%〜12%)を大きく外れる
 * ようであれば、特定の犬種に判定が偏りすぎている可能性が高い。
 */
class DogTypeDistributionTest {

    // 軸ごとの質問構成: {重要質問2問, 通常質問3問} のquestionId、対応するdelta量は{2,2,1,1,1}
    private static final int[][] AXIS_QUESTION_IDS = {
            {1, 2, 3, 4, 5},        // sociability
            {6, 7, 8, 9, 10},       // activity
            {11, 12, 13, 14, 15},   // independence
            {16, 17, 18, 19, 20},   // emotionalExpression
            {21, 22, 23, 24, 25},   // caution
            {26, 27, 28, 29, 30},   // cooperativeness
    };
    private static final int[] AXIS_DELTAS = {2, 2, 1, 1, 1};

    private static final double TARGET_LOW = 5.0;
    private static final double TARGET_HIGH = 12.0;

    @Test
    void distributionShouldStayWithinSafeRange() {
        List<Question> questions = buildQuestions();
        List<Choice> choices = buildChoices();
        List<DogType> dogTypes = buildDogTypes();

        QuestionRepository questionRepository = mock(QuestionRepository.class);
        ChoiceRepository choiceRepository = mock(ChoiceRepository.class);
        DogTypeRepository dogTypeRepository = mock(DogTypeRepository.class);

        when(questionRepository.findAllByOrderByDisplayOrderAsc()).thenReturn(questions);
        when(choiceRepository.findByQuestionInOrderByIdAsc(questions)).thenReturn(choices);
        when(dogTypeRepository.findAll()).thenReturn(dogTypes);
        when(choiceRepository.findAllWithQuestionByIdIn(anyList())).thenAnswer(invocation -> {
            List<Long> ids = invocation.getArgument(0);
            return choices.stream().filter(c -> ids.contains(c.getId())).toList();
        });

        DiagnosisService diagnosisService =
                new DiagnosisService(questionRepository, choiceRepository, dogTypeRepository);

        // 軸ごとに、raw値8パターンそれぞれの「代表となる1つのbitmask」と「出現回数(重み)」を求める
        List<AxisPattern> axisPatterns = new ArrayList<>();
        for (int[] questionIds : AXIS_QUESTION_IDS) {
            axisPatterns.add(buildAxisPattern(questionIds));
        }

        Map<String, Double> weightByCode = new HashMap<>();
        double totalWeight = 0;

        int[] indices = new int[6];
        int patternCount = axisPatterns.get(0).rawValues.size();
        long totalCombinations = (long) Math.pow(patternCount, 6);

        for (long combo = 0; combo < totalCombinations; combo++) {
            long remainder = combo;
            double weight = 1.0;
            List<AnswerRequest> answers = new ArrayList<>();

            for (int axis = 0; axis < 6; axis++) {
                int idx = (int) (remainder % patternCount);
                remainder /= patternCount;
                indices[axis] = idx;

                AxisPattern pattern = axisPatterns.get(axis);
                weight *= pattern.weights.get(idx);
                answers.addAll(pattern.answersByPattern.get(idx));
            }

            DiagnosisResponse response = diagnosisService.diagnose(new DiagnosisRequest(answers));
            weightByCode.merge(response.dogType().code(), weight, Double::sum);
            totalWeight += weight;
        }

        System.out.println("=== 12犬種 判定分布(理論値・全数検証) ===");
        for (DogType dogType : dogTypes) {
            double pct = weightByCode.getOrDefault(dogType.getCode(), 0.0) / totalWeight * 100;
            System.out.printf("%-16s: %6.2f%%%n", dogType.getCode(), pct);
        }

        for (DogType dogType : dogTypes) {
            double pct = weightByCode.getOrDefault(dogType.getCode(), 0.0) / totalWeight * 100;
            assertThat(pct)
                    .as("犬種 " + dogType.getCode() + " の判定率が安全範囲(%.1f%%〜%.1f%%)を外れています"
                            .formatted(TARGET_LOW, TARGET_HIGH))
                    .isBetween(TARGET_LOW, TARGET_HIGH);
        }
    }

    /** 1軸(5問)の全32通りのYES/NOパターンを、生スコアの値ごとに集約する */
    private AxisPattern buildAxisPattern(int[] questionIds) {
        Map<Integer, Double> weights = new HashMap<>();
        Map<Integer, List<AnswerRequest>> answersByRaw = new HashMap<>();

        for (int bitmask = 0; bitmask < 32; bitmask++) {
            int raw = 0;
            List<AnswerRequest> answers = new ArrayList<>();
            for (int i = 0; i < 5; i++) {
                boolean yes = ((bitmask >> i) & 1) == 1;
                int questionId = questionIds[i];
                raw += yes ? AXIS_DELTAS[i] : -AXIS_DELTAS[i];
                // choice id規則: questionId=qの「はい」=2q-1, 「いいえ」=2q (data.sqlの並びと一致)
                long choiceId = yes ? (2L * questionId - 1) : (2L * questionId);
                answers.add(new AnswerRequest((long) questionId, choiceId));
            }
            weights.merge(raw, 1.0, Double::sum);
            answersByRaw.putIfAbsent(raw, answers);
        }

        List<Integer> sortedRaws = weights.keySet().stream().sorted().toList();
        AxisPattern pattern = new AxisPattern();
        for (int raw : sortedRaws) {
            pattern.rawValues.add(raw);
            pattern.weights.add(weights.get(raw));
            pattern.answersByPattern.add(answersByRaw.get(raw));
        }
        return pattern;
    }

    private static class AxisPattern {
        List<Integer> rawValues = new ArrayList<>();
        List<Double> weights = new ArrayList<>();
        List<List<AnswerRequest>> answersByPattern = new ArrayList<>();
    }

    private List<Question> buildQuestions() {
        List<Question> questions = new ArrayList<>();
        for (int i = 1; i <= 30; i++) {
            questions.add(new Question((long) i, "question-" + i, i));
        }
        return questions;
    }

    private List<Choice> buildChoices() {
        Map<Long, Question> questionById = new HashMap<>();
        for (Question q : buildQuestions()) {
            questionById.put(q.getId(), q);
        }

        List<Choice> choices = new ArrayList<>();
        long choiceId = 1;
        for (int[] questionIds : AXIS_QUESTION_IDS) {
            int axisIndex = indexOfAxis(questionIds);
            for (int i = 0; i < questionIds.length; i++) {
                int questionId = questionIds[i];
                int delta = AXIS_DELTAS[i];
                choices.add(deltaChoice(choiceId++, questionById.get((long) questionId), axisIndex, delta));
                choices.add(deltaChoice(choiceId++, questionById.get((long) questionId), axisIndex, -delta));
            }
        }
        return choices;
    }

    private int indexOfAxis(int[] questionIds) {
        for (int axis = 0; axis < AXIS_QUESTION_IDS.length; axis++) {
            if (AXIS_QUESTION_IDS[axis] == questionIds) {
                return axis;
            }
        }
        throw new IllegalStateException("unreachable");
    }

    /** axisIndex: 0=sociability 1=activity 2=independence 3=emotionalExpression 4=caution 5=cooperativeness */
    private Choice deltaChoice(long id, Question question, int axisIndex, int delta) {
        int[] deltas = new int[6];
        deltas[axisIndex] = delta;
        return new Choice(id, question, delta > 0 ? "はい" : "いいえ",
                deltas[0], deltas[1], deltas[2], deltas[3], deltas[4], deltas[5]);
    }

    private List<DogType> buildDogTypes() {
        List<DogType> dogTypes = new ArrayList<>();
        dogTypes.add(dogType(1, "SHIBA", 3.0, 2.0, 4.0, 1.0, 4.0, 1.5));
        dogTypes.add(dogType(2, "HUSKY", 3.5, 5.0, 3.0, 3.5, 3.5, 1.0));
        dogTypes.add(dogType(3, "POMERANIAN", 2.0, 4.5, 2.0, 2.5, 4.0, 1.5));
        dogTypes.add(dogType(4, "TOYPOODLE", 4.0, 3.0, 2.0, 5.0, 1.5, 3.5));
        dogTypes.add(dogType(5, "GOLDEN", 5.0, 4.0, 2.0, 3.0, 2.0, 4.0));
        dogTypes.add(dogType(6, "CHIHUAHUA", 3.0, 3.0, 4.5, 4.5, 4.5, 1.5));
        dogTypes.add(dogType(7, "FRENCHBULL", 5.0, 1.0, 2.0, 3.0, 2.5, 3.5));
        dogTypes.add(dogType(8, "BORDERCOLLIE", 2.5, 4.5, 1.5, 3.0, 2.0, 4.5));
        dogTypes.add(dogType(9, "BEAGLE", 4.0, 2.5, 3.0, 5.0, 2.5, 5.0));
        dogTypes.add(dogType(10, "GERMANSHEPHERD", 2.5, 4.0, 4.0, 1.5, 4.5, 4.5));
        dogTypes.add(dogType(11, "DOBERMAN", 1.5, 3.5, 2.5, 1.0, 4.5, 3.0));
        dogTypes.add(dogType(12, "SAMOYED", 5.0, 4.0, 4.5, 4.0, 2.0, 3.5));
        return dogTypes;
    }

    private DogType dogType(long id, String code, double sociability, double activity, double independence,
            double emotionalExpression, double caution, double cooperativeness) {
        DogType dogType = new DogType();
        dogType.setId(id);
        dogType.setCode(code);
        dogType.setName(code);
        dogType.setTitle(code);
        dogType.setDescription(code);
        dogType.setTrivia(code);
        dogType.setImageUrl(null);
        dogType.setSociability(BigDecimal.valueOf(sociability));
        dogType.setActivity(BigDecimal.valueOf(activity));
        dogType.setIndependence(BigDecimal.valueOf(independence));
        dogType.setEmotionalExpression(BigDecimal.valueOf(emotionalExpression));
        dogType.setCaution(BigDecimal.valueOf(caution));
        dogType.setCooperativeness(BigDecimal.valueOf(cooperativeness));
        return dogType;
    }
}
