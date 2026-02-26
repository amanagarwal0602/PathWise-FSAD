package com.pathwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_results")
public class TestResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long studentId;
    
    @Column(nullable = false)
    private String testType;
    
    private Integer score;
    private Integer maxScore;
    
    @Column(columnDefinition = "TEXT")
    private String answers;
    
    @Column(columnDefinition = "TEXT")
    private String analysis;
    
    private Integer timeTaken;
    
    @Column(name = "completed_at", columnDefinition = "DATETIME")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt;
    
    public TestResult() {}
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
    
    public String getAnswers() { return answers; }
    public void setAnswers(String answers) { this.answers = answers; }
    
    public String getAnalysis() { return analysis; }
    public void setAnalysis(String analysis) { this.analysis = analysis; }
    
    public Integer getTimeTaken() { return timeTaken; }
    public void setTimeTaken(Integer timeTaken) { this.timeTaken = timeTaken; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
}
