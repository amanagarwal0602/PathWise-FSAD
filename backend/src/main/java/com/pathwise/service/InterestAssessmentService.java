package com.pathwise.service;

import com.pathwise.dto.ApiResponse;
import com.pathwise.entity.InterestAssessment;
import com.pathwise.repository.InterestAssessmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class InterestAssessmentService {
    
    private final InterestAssessmentRepository interestAssessmentRepository;
    
    public InterestAssessmentService(InterestAssessmentRepository interestAssessmentRepository) {
        this.interestAssessmentRepository = interestAssessmentRepository;
    }
    
    public Optional<InterestAssessment> getAssessmentByStudent(Long studentId) {
        return interestAssessmentRepository.findTopByStudentIdOrderByCreatedAtDesc(studentId);
    }
    
    public InterestAssessment saveAssessment(Long studentId, String interests, String skills,
                                             String strengths, String weaknesses, 
                                             String careerSuggestions, String personalityTraits) {
        Optional<InterestAssessment> existingOpt = interestAssessmentRepository.findByStudentId(studentId);
        
        InterestAssessment assessment;
        if (existingOpt.isPresent()) {
            assessment = existingOpt.get();
        } else {
            assessment = new InterestAssessment();
            assessment.setStudentId(studentId);
        }
        
        assessment.setInterests(interests);
        assessment.setSkills(skills);
        assessment.setStrengths(strengths);
        assessment.setWeaknesses(weaknesses);
        assessment.setCareerSuggestions(careerSuggestions);
        assessment.setPersonalityTraits(personalityTraits);
        
        return interestAssessmentRepository.save(assessment);
    }
    
    public ApiResponse<InterestAssessment> completeAssessment(Long studentId) {
        Optional<InterestAssessment> assessmentOpt = interestAssessmentRepository.findByStudentId(studentId);
        
        if (assessmentOpt.isEmpty()) {
            return ApiResponse.error("Assessment not found");
        }
        
        InterestAssessment assessment = assessmentOpt.get();
        assessment.setIsComplete(true);
        assessment.setCompletedAt(LocalDateTime.now());
        
        InterestAssessment savedAssessment = interestAssessmentRepository.save(assessment);
        return ApiResponse.success("Assessment completed", savedAssessment);
    }
    
    public boolean hasCompletedAssessment(Long studentId) {
        return interestAssessmentRepository.existsByStudentIdAndIsCompleteTrue(studentId);
    }
}
