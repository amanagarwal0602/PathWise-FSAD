package com.pathwise.dto;

public class RegisterRequest {
    private String name;
    private String username;
    private String email;
    private String password;
    private String role;
    private String college;
    private String branch;
    private String year;
    private String careerGoals;
    private String achievements;
    private String phoneNumber;
    private String studentId;
    private String idProofType;
    private String specialization;
    
    public RegisterRequest() {}
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
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
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
}
