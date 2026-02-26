package com.pathwise.controller;

import com.pathwise.dto.ApiResponse;
import com.pathwise.entity.Meeting;
import com.pathwise.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {
    
    private final MeetingService meetingService;
    
    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Meeting>> getMeetingsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(meetingService.getMeetingsByStudent(studentId));
    }
    
    @GetMapping("/counsellor/{counsellorId}")
    public ResponseEntity<List<Meeting>> getMeetingsByCounsellor(@PathVariable Long counsellorId) {
        return ResponseEntity.ok(meetingService.getMeetingsByCounsellor(counsellorId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Meeting>> getMeetingById(@PathVariable Long id) {
        return meetingService.getMeetingById(id)
                .map(meeting -> ResponseEntity.ok(ApiResponse.success("Meeting found", meeting)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Meeting> scheduleMeeting(@RequestBody Map<String, Object> body) {
        Long studentId = Long.parseLong(body.get("studentId").toString());
        Long counsellorId = Long.parseLong(body.get("counsellorId").toString());
        String title = body.get("title").toString();
        String description = body.get("description") != null ? body.get("description").toString() : "";
        LocalDateTime scheduledTime = LocalDateTime.parse(body.get("scheduledTime").toString());
        Integer duration = body.get("duration") != null ? Integer.parseInt(body.get("duration").toString()) : 30;
        
        return ResponseEntity.ok(meetingService.scheduleMeeting(studentId, counsellorId, title, description, scheduledTime, duration));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Meeting>> updateMeetingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        
        ApiResponse<Meeting> response = meetingService.updateMeetingStatus(id, status);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<Meeting>> addMeetingNotes(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String notes = body.get("notes");
        
        ApiResponse<Meeting> response = meetingService.addMeetingNotes(id, notes);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<Meeting>> rescheduleMeeting(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        LocalDateTime newTime = LocalDateTime.parse(body.get("scheduledTime"));
        
        ApiResponse<Meeting> response = meetingService.rescheduleMeeting(id, newTime);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelMeeting(@PathVariable Long id) {
        ApiResponse<Void> response = meetingService.cancelMeeting(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/counsellor/{counsellorId}/upcoming")
    public ResponseEntity<List<Meeting>> getUpcomingMeetings(
            @PathVariable Long counsellorId,
            @RequestParam String from,
            @RequestParam String to) {
        LocalDateTime fromTime = LocalDateTime.parse(from);
        LocalDateTime toTime = LocalDateTime.parse(to);
        return ResponseEntity.ok(meetingService.getUpcomingMeetings(counsellorId, fromTime, toTime));
    }
    
    @GetMapping("/counsellor/{counsellorId}/count")
    public ResponseEntity<Long> getMeetingsCount(
            @PathVariable Long counsellorId,
            @RequestParam String status) {
        return ResponseEntity.ok(meetingService.getMeetingsCountByCounsellor(counsellorId, status));
    }
}
