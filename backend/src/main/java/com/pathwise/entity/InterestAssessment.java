package com.pathwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interest_assessments")
public class InterestAssessment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long studentId;
    
    @Column(columnDefinition = "TEXT")
    private String interests;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    @Column(columnDefinition = "TEXT")
    private String strengths;
    
    @Column(columnDefinition = "TEXT")
    private String weaknesses;
    
    @Column(columnDefinition = "TEXT")
    private String careerSuggestions;
    
    @Column(columnDefinition = "TEXT")
    private String personalityTraits;
    
    private Boolean isComplete = false;
    
    @Column(name = "completed_at", columnDefinition = "DATETIME")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", columnDefinition = "DATETIME")
    private LocalDateTime updatedAt;
    
    public InterestAssessment() {}
    
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
    
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    
    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    
    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
    
    public String getCareerSuggestions() { return careerSuggestions; }
    public void setCareerSuggestions(String careerSuggestions) { this.careerSuggestions = careerSuggestions; }
    
    public String getPersonalityTraits() { return personalityTraits; }
    public void setPersonalityTraits(String personalityTraits) { this.personalityTraits = personalityTraits; }
    
    public Boolean getIsComplete() { return isComplete; }
    public void setIsComplete(Boolean isComplete) { this.isComplete = isComplete; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
