package com.pathwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_notes")
public class StudentNote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "counsellor_id", nullable = false)
    private Long counsellorId;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "is_private")
    private Boolean isPrivate = true;
    
    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", columnDefinition = "DATETIME")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public Long getCounsellorId() { return counsellorId; }
    public void setCounsellorId(Long counsellorId) { this.counsellorId = counsellorId; }
    
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    
    public Boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
