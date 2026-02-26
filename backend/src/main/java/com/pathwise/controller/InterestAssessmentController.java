package com.pathwise.controller;

import com.pathwise.dto.ApiResponse;
import com.pathwise.entity.InterestAssessment;
import com.pathwise.service.InterestAssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class InterestAssessmentController {
    
    private final InterestAssessmentService interestAssessmentService;
    
    public InterestAssessmentController(InterestAssessmentService interestAssessmentService) {
        this.interestAssessmentService = interestAssessmentService;
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<InterestAssessment>> getAssessmentByStudent(@PathVariable Long studentId) {
        return interestAssessmentService.getAssessmentByStudent(studentId)
                .map(assessment -> ResponseEntity.ok(ApiResponse.success("Assessment found", assessment)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No assessment found", null)));
    }
    
    @PostMapping
    public ResponseEntity<InterestAssessment> saveAssessment(@RequestBody Map<String, Object> body) {
        Long studentId = Long.parseLong(body.get("studentId").toString());
        String interests = body.get("interests") != null ? body.get("interests").toString() : "";
        String skills = body.get("skills") != null ? body.get("skills").toString() : "";
        String strengths = body.get("strengths") != null ? body.get("strengths").toString() : "";
        String weaknesses = body.get("weaknesses") != null ? body.get("weaknesses").toString() : "";
        String careerSuggestions = body.get("careerSuggestions") != null ? body.get("careerSuggestions").toString() : "";
        String personalityTraits = body.get("personalityTraits") != null ? body.get("personalityTraits").toString() : "";
        
        return ResponseEntity.ok(interestAssessmentService.saveAssessment(studentId, interests, skills, 
                strengths, weaknesses, careerSuggestions, personalityTraits));
    }
    
    @PostMapping("/student/{studentId}/complete")
    public ResponseEntity<ApiResponse<InterestAssessment>> completeAssessment(@PathVariable Long studentId) {
        ApiResponse<InterestAssessment> response = interestAssessmentService.completeAssessment(studentId);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/student/{studentId}/hasCompleted")
    public ResponseEntity<Boolean> hasCompletedAssessment(@PathVariable Long studentId) {
        return ResponseEntity.ok(interestAssessmentService.hasCompletedAssessment(studentId));
    }
}
