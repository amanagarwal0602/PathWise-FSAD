package com.pathwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
public class Meeting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long studentId;
    
    @Column(nullable = false)
    private Long counsellorId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime scheduledTime;
    
    private Integer duration = 30;
    
    @Enumerated(EnumType.STRING)
    private MeetingStatus status = MeetingStatus.SCHEDULED;
    
    private String meetingLink;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", columnDefinition = "DATETIME")
    private LocalDateTime updatedAt;
    
    public Meeting() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum MeetingStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public Long getCounsellorId() { return counsellorId; }
    public void setCounsellorId(Long counsellorId) { this.counsellorId = counsellorId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
