package com.pathwise.controller;

import com.pathwise.dto.ApiResponse;
import com.pathwise.entity.TestResult;
import com.pathwise.service.TestResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
public class TestResultController {
    
    private final TestResultService testResultService;
    
    public TestResultController(TestResultService testResultService) {
        this.testResultService = testResultService;
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TestResult>> getTestResultsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(testResultService.getTestResultsByStudent(studentId));
    }
    
    @GetMapping("/student/{studentId}/latest")
    public ResponseEntity<ApiResponse<TestResult>> getLatestTestResult(
            @PathVariable Long studentId,
            @RequestParam String testType) {
        return testResultService.getLatestTestResult(studentId, testType)
                .map(result -> ResponseEntity.ok(ApiResponse.success("Test result found", result)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No test result found", null)));
    }
    
    @PostMapping
    public ResponseEntity<TestResult> saveTestResult(@RequestBody Map<String, Object> body) {
        Long studentId = Long.parseLong(body.get("studentId").toString());
        String testType = body.get("testType").toString();
        Integer score = Integer.parseInt(body.get("score").toString());
        Integer maxScore = Integer.parseInt(body.get("maxScore").toString());
        String answers = body.get("answers") != null ? body.get("answers").toString() : "";
        String analysis = body.get("analysis") != null ? body.get("analysis").toString() : "";
        Integer timeTaken = body.get("timeTaken") != null ? Integer.parseInt(body.get("timeTaken").toString()) : null;
        
        return ResponseEntity.ok(testResultService.saveTestResult(studentId, testType, score, maxScore, answers, analysis, timeTaken));
    }
    
    @GetMapping("/student/{studentId}/hasCompleted")
    public ResponseEntity<Boolean> hasCompletedTest(
            @PathVariable Long studentId,
            @RequestParam String testType) {
        return ResponseEntity.ok(testResultService.hasCompletedTest(studentId, testType));
    }
    
    @GetMapping("/student/{studentId}/count")
    public ResponseEntity<Long> getTestCount(@PathVariable Long studentId) {
        return ResponseEntity.ok(testResultService.getTestCount(studentId));
    }
}
