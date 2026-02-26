package com.pathwise.repository;

import com.pathwise.entity.InterestAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterestAssessmentRepository extends JpaRepository<InterestAssessment, Long> {
    
    Optional<InterestAssessment> findByStudentId(Long studentId);
    
    Optional<InterestAssessment> findTopByStudentIdOrderByCreatedAtDesc(Long studentId);
    
    boolean existsByStudentId(Long studentId);
    
    boolean existsByStudentIdAndIsCompleteTrue(Long studentId);
}
