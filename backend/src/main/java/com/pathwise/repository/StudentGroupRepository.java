package com.pathwise.repository;

import com.pathwise.entity.StudentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentGroupRepository extends JpaRepository<StudentGroup, Long> {
    
    List<StudentGroup> findByCreatedBy(Long counsellorId);
    
    List<StudentGroup> findByIsActiveTrue();
    
    List<StudentGroup> findByCreatedByAndIsActiveTrue(Long counsellorId);
    
    boolean existsByNameAndCreatedBy(String name, Long counsellorId);
}
