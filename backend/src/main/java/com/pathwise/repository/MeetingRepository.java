package com.pathwise.repository;

import com.pathwise.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    
    List<Meeting> findByStudentId(Long studentId);
    
    List<Meeting> findByCounsellorId(Long counsellorId);
    
    List<Meeting> findByStudentIdAndStatus(Long studentId, Meeting.MeetingStatus status);
    
    List<Meeting> findByCounsellorIdAndStatus(Long counsellorId, Meeting.MeetingStatus status);
    
    List<Meeting> findByScheduledTimeBetween(LocalDateTime start, LocalDateTime end);
    
    List<Meeting> findByCounsellorIdAndScheduledTimeBetween(Long counsellorId, LocalDateTime start, LocalDateTime end);
    
    List<Meeting> findByStudentIdOrderByScheduledTimeDesc(Long studentId);
    
    List<Meeting> findByCounsellorIdOrderByScheduledTimeDesc(Long counsellorId);
    
    long countByStudentId(Long studentId);
    
    long countByCounsellorIdAndStatus(Long counsellorId, Meeting.MeetingStatus status);
}
