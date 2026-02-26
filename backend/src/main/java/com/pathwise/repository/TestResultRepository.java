package com.pathwise.repository;

import com.pathwise.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    
    List<TestResult> findByStudentId(Long studentId);
    
    List<TestResult> findByStudentIdAndTestType(Long studentId, String testType);
    
    Optional<TestResult> findTopByStudentIdAndTestTypeOrderByCompletedAtDesc(Long studentId, String testType);
    
    List<TestResult> findByStudentIdOrderByCompletedAtDesc(Long studentId);
    
    long countByStudentId(Long studentId);
    
    boolean existsByStudentIdAndTestType(Long studentId, String testType);
}
