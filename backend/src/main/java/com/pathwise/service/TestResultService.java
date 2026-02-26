package com.pathwise.service;

import com.pathwise.entity.TestResult;
import com.pathwise.repository.TestResultRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TestResultService {
    
    private final TestResultRepository testResultRepository;
    
    public TestResultService(TestResultRepository testResultRepository) {
        this.testResultRepository = testResultRepository;
    }
    
    public List<TestResult> getTestResultsByStudent(Long studentId) {
        return testResultRepository.findByStudentIdOrderByCompletedAtDesc(studentId);
    }
    
    public Optional<TestResult> getLatestTestResult(Long studentId, String testType) {
        return testResultRepository.findTopByStudentIdAndTestTypeOrderByCompletedAtDesc(studentId, testType);
    }
    
    public TestResult saveTestResult(Long studentId, String testType, Integer score, 
                                     Integer maxScore, String answers, String analysis, Integer timeTaken) {
        TestResult testResult = new TestResult();
        testResult.setStudentId(studentId);
        testResult.setTestType(testType);
        testResult.setScore(score);
        testResult.setMaxScore(maxScore);
        testResult.setAnswers(answers);
        testResult.setAnalysis(analysis);
        testResult.setTimeTaken(timeTaken);
        testResult.setCompletedAt(LocalDateTime.now());
        
        return testResultRepository.save(testResult);
    }
    
    public boolean hasCompletedTest(Long studentId, String testType) {
        return testResultRepository.existsByStudentIdAndTestType(studentId, testType);
    }
    
    public long getTestCount(Long studentId) {
        return testResultRepository.countByStudentId(studentId);
    }
}
