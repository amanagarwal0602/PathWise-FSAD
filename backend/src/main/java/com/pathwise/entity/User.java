package com.pathwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    private String passwordSalt;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;
    
    private String college;
    private String branch;
    private String year;
    private String careerGoals;
    private String achievements;
    private String phoneNumber;
    private String studentId;
    private String idProofType;
    private String guidanceStage;
    
    @Column(name = "assigned_counsellor_id")
    private Long assignedCounsellor;
    
    private Boolean assessmentCompleted = false;
    private Boolean flagged = false;
    private String flagReason;
    
    @Column(columnDefinition = "DATETIME")
    private LocalDateTime flaggedAt;
    
    private String specialization;
    private Double rating = 0.0;
    private Integer reviewCount = 0;
    
    private String evaluatorType;
    
    private Long verifiedBy;
    
    @Column(columnDefinition = "DATETIME")
    private LocalDateTime verifiedAt;
    private String verificationNotes;
    private String rejectionReason;
    
    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", columnDefinition = "DATETIME")
    private LocalDateTime updatedAt;
    
    public User() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Role {
        STUDENT, COUNSELLOR, GENERAL_COUNSELLOR, EVALUATOR, ADMIN
    }
    
    public enum UserStatus {
        ACTIVE, INACTIVE, PENDING_VERIFICATION, VERIFIED, REJECTED
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    
    public String getPasswordSalt() { return passwordSalt; }
    public void setPasswordSalt(String passwordSalt) { this.passwordSalt = passwordSalt; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    public String getCareerGoals() { return careerGoals; }
    public void setCareerGoals(String careerGoals) { this.careerGoals = careerGoals; }
    
    public String getAchievements() { return achievements; }
    public void setAchievements(String achievements) { this.achievements = achievements; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getIdProofType() { return idProofType; }
    public void setIdProofType(String idProofType) { this.idProofType = idProofType; }
    
    public String getGuidanceStage() { return guidanceStage; }
    public void setGuidanceStage(String guidanceStage) { this.guidanceStage = guidanceStage; }
    
    public Long getAssignedCounsellor() { return assignedCounsellor; }
    public void setAssignedCounsellor(Long assignedCounsellor) { this.assignedCounsellor = assignedCounsellor; }
    
    public Boolean getAssessmentCompleted() { return assessmentCompleted; }
    public void setAssessmentCompleted(Boolean assessmentCompleted) { this.assessmentCompleted = assessmentCompleted; }
    
    public Boolean getFlagged() { return flagged; }
    public void setFlagged(Boolean flagged) { this.flagged = flagged; }
    
    public String getFlagReason() { return flagReason; }
    public void setFlagReason(String flagReason) { this.flagReason = flagReason; }
    
    public LocalDateTime getFlaggedAt() { return flaggedAt; }
    public void setFlaggedAt(LocalDateTime flaggedAt) { this.flaggedAt = flaggedAt; }
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    
    public String getEvaluatorType() { return evaluatorType; }
    public void setEvaluatorType(String evaluatorType) { this.evaluatorType = evaluatorType; }
    
    public Long getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(Long verifiedBy) { this.verifiedBy = verifiedBy; }
    
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    
    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
