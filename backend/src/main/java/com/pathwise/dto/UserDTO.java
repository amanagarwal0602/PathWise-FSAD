package com.pathwise.dto;

import com.pathwise.entity.User;
import java.time.LocalDateTime;

public class UserDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String role;
    private String status;
    private String college;
    private String branch;
    private String year;
    private String careerGoals;
    private String achievements;
    private String phoneNumber;
    private String studentId;
    private String idProofType;
    private String guidanceStage;
    private Long assignedCounsellor;
    private Boolean assessmentCompleted;
    private Boolean flagged;
    private String flagReason;
    private String specialization;
    private Double rating;
    private Integer reviewCount;
    private String evaluatorType;
    private LocalDateTime createdAt;
    
    public UserDTO() {}
    
    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setStatus(user.getStatus().name());
        dto.setCollege(user.getCollege());
        dto.setBranch(user.getBranch());
        dto.setYear(user.getYear());
        dto.setCareerGoals(user.getCareerGoals());
        dto.setAchievements(user.getAchievements());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStudentId(user.getStudentId());
        dto.setIdProofType(user.getIdProofType());
        dto.setGuidanceStage(user.getGuidanceStage());
        dto.setAssignedCounsellor(user.getAssignedCounsellor());
        dto.setAssessmentCompleted(user.getAssessmentCompleted());
        dto.setFlagged(user.getFlagged());
        dto.setFlagReason(user.getFlagReason());
        dto.setSpecialization(user.getSpecialization());
        dto.setRating(user.getRating());
        dto.setReviewCount(user.getReviewCount());
        dto.setEvaluatorType(user.getEvaluatorType());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
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
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
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
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    
    public String getEvaluatorType() { return evaluatorType; }
    public void setEvaluatorType(String evaluatorType) { this.evaluatorType = evaluatorType; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
