package com.pathwise.repository;

import com.pathwise.entity.StudentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentNoteRepository extends JpaRepository<StudentNote, Long> {
    
    List<StudentNote> findByStudentId(Long studentId);
    
    List<StudentNote> findByCounsellorId(Long counsellorId);
    
    List<StudentNote> findByStudentIdAndCounsellorId(Long studentId, Long counsellorId);
    
    List<StudentNote> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
