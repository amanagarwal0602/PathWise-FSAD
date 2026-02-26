package com.pathwise.service;

import com.pathwise.dto.ApiResponse;
import com.pathwise.entity.Meeting;
import com.pathwise.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingService {
    
    private final MeetingRepository meetingRepository;
    
    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }
    
    public List<Meeting> getMeetingsByStudent(Long studentId) {
        return meetingRepository.findByStudentIdOrderByScheduledTimeDesc(studentId);
    }
    
    public List<Meeting> getMeetingsByCounsellor(Long counsellorId) {
        return meetingRepository.findByCounsellorIdOrderByScheduledTimeDesc(counsellorId);
    }
    
    public Optional<Meeting> getMeetingById(Long id) {
        return meetingRepository.findById(id);
    }
    
    public Meeting scheduleMeeting(Long studentId, Long counsellorId, String title, 
                                   String description, LocalDateTime scheduledTime, Integer duration) {
        Meeting meeting = new Meeting();
        meeting.setStudentId(studentId);
        meeting.setCounsellorId(counsellorId);
        meeting.setTitle(title);
        meeting.setDescription(description);
        meeting.setScheduledTime(scheduledTime);
        meeting.setDuration(duration != null ? duration : 30);
        meeting.setStatus(Meeting.MeetingStatus.SCHEDULED);
        
        return meetingRepository.save(meeting);
    }
    
    public ApiResponse<Meeting> updateMeetingStatus(Long meetingId, String status) {
        Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
        
        if (meetingOpt.isEmpty()) {
            return ApiResponse.error("Meeting not found");
        }
        
        Meeting meeting = meetingOpt.get();
        
        try {
            Meeting.MeetingStatus meetingStatus = Meeting.MeetingStatus.valueOf(status.toUpperCase());
            meeting.setStatus(meetingStatus);
            Meeting savedMeeting = meetingRepository.save(meeting);
            return ApiResponse.success("Meeting status updated", savedMeeting);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Invalid status: " + status);
        }
    }
    
    public ApiResponse<Meeting> addMeetingNotes(Long meetingId, String notes) {
        Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
        
        if (meetingOpt.isEmpty()) {
            return ApiResponse.error("Meeting not found");
        }
        
        Meeting meeting = meetingOpt.get();
        meeting.setNotes(notes);
        Meeting savedMeeting = meetingRepository.save(meeting);
        return ApiResponse.success("Notes added", savedMeeting);
    }
    
    public ApiResponse<Meeting> rescheduleMeeting(Long meetingId, LocalDateTime newTime) {
        Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
        
        if (meetingOpt.isEmpty()) {
            return ApiResponse.error("Meeting not found");
        }
        
        Meeting meeting = meetingOpt.get();
        meeting.setScheduledTime(newTime);
        meeting.setStatus(Meeting.MeetingStatus.RESCHEDULED);
        Meeting savedMeeting = meetingRepository.save(meeting);
        return ApiResponse.success("Meeting rescheduled", savedMeeting);
    }
    
    public ApiResponse<Void> cancelMeeting(Long meetingId) {
        Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
        
        if (meetingOpt.isEmpty()) {
            return ApiResponse.error("Meeting not found");
        }
        
        Meeting meeting = meetingOpt.get();
        meeting.setStatus(Meeting.MeetingStatus.CANCELLED);
        meetingRepository.save(meeting);
        return ApiResponse.success("Meeting cancelled", null);
    }
    
    public List<Meeting> getUpcomingMeetings(Long counsellorId, LocalDateTime from, LocalDateTime to) {
        return meetingRepository.findByCounsellorIdAndScheduledTimeBetween(counsellorId, from, to);
    }
    
    public long getMeetingsCountByCounsellor(Long counsellorId, String status) {
        try {
            Meeting.MeetingStatus meetingStatus = Meeting.MeetingStatus.valueOf(status.toUpperCase());
            return meetingRepository.countByCounsellorIdAndStatus(counsellorId, meetingStatus);
        } catch (IllegalArgumentException e) {
            return 0;
        }
    }
}
