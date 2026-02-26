package com.pathwise.service;

import com.pathwise.dto.ApiResponse;
import com.pathwise.dto.UserDTO;
import com.pathwise.entity.User;
import com.pathwise.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(UserDTO::fromEntity);
    }
    
    public List<UserDTO> getUsersByRole(String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            return userRepository.findByRole(userRole).stream()
                    .map(UserDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
    
    public List<UserDTO> getUsersByStatus(String status) {
        try {
            User.UserStatus userStatus = User.UserStatus.valueOf(status.toUpperCase());
            return userRepository.findByStatus(userStatus).stream()
                    .map(UserDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
    
    public List<UserDTO> getPendingVerificationUsers() {
        return userRepository.findByStatus(User.UserStatus.PENDING_VERIFICATION).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getStudentsByCounsellor(Long counsellorId) {
        return userRepository.findByAssignedCounsellor(counsellorId).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getFlaggedStudents() {
        return userRepository.findByFlaggedTrue().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public ApiResponse<UserDTO> updateUser(Long id, UserDTO userDTO) {
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }
        
        User user = userOpt.get();
        
        if (userDTO.getName() != null) user.setName(userDTO.getName());
        if (userDTO.getCollege() != null) user.setCollege(userDTO.getCollege());
        if (userDTO.getBranch() != null) user.setBranch(userDTO.getBranch());
        if (userDTO.getYear() != null) user.setYear(userDTO.getYear());
        if (userDTO.getCareerGoals() != null) user.setCareerGoals(userDTO.getCareerGoals());
        if (userDTO.getAchievements() != null) user.setAchievements(userDTO.getAchievements());
        if (userDTO.getPhoneNumber() != null) user.setPhoneNumber(userDTO.getPhoneNumber());
        if (userDTO.getGuidanceStage() != null) user.setGuidanceStage(userDTO.getGuidanceStage());
        if (userDTO.getSpecialization() != null) user.setSpecialization(userDTO.getSpecialization());
        if (userDTO.getAssessmentCompleted() != null) user.setAssessmentCompleted(userDTO.getAssessmentCompleted());
        
        User savedUser = userRepository.save(user);
        return ApiResponse.success("User updated", UserDTO.fromEntity(savedUser));
    }
    
    public ApiResponse<UserDTO> verifyUser(Long userId, Long verifierId, String notes) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }
        
        User user = userOpt.get();
        user.setStatus(User.UserStatus.VERIFIED);
        user.setVerifiedBy(verifierId);
        user.setVerifiedAt(LocalDateTime.now());
        user.setVerificationNotes(notes);
        
        User savedUser = userRepository.save(user);
        return ApiResponse.success("User verified", UserDTO.fromEntity(savedUser));
    }
    
    public ApiResponse<UserDTO> rejectUser(Long userId, Long verifierId, String reason) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }
        
        User user = userOpt.get();
        user.setStatus(User.UserStatus.REJECTED);
        user.setVerifiedBy(verifierId);
        user.setVerifiedAt(LocalDateTime.now());
        user.setRejectionReason(reason);
        
        User savedUser = userRepository.save(user);
        return ApiResponse.success("User rejected", UserDTO.fromEntity(savedUser));
    }
    
    public ApiResponse<UserDTO> promoteUser(Long userId, String newRole) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }
        
        User user = userOpt.get();
        
        try {
            User.Role role = User.Role.valueOf(newRole.toUpperCase());
            user.setRole(role);
            User savedUser = userRepository.save(user);
            return ApiResponse.success("User promoted to " + role.name(), UserDTO.fromEntity(savedUser));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Invalid role: " + newRole);
        }
    }
    
    public ApiResponse<UserDTO> assignCounsellor(Long studentId, Long counsellorId) {
        Optional<User> studentOpt = userRepository.findById(studentId);
        
        if (studentOpt.isEmpty()) {
            return ApiResponse.error("Student not found");
        }
        
        User student = studentOpt.get();
        if (student.getRole() != User.Role.STUDENT) {
            return ApiResponse.error("User is not a student");
        }
        
        student.setAssignedCounsellor(counsellorId);
        User savedUser = userRepository.save(student);
        return ApiResponse.success("Counsellor assigned", UserDTO.fromEntity(savedUser));
    }
    
    public ApiResponse<UserDTO> flagStudent(Long studentId, String reason) {
        Optional<User> studentOpt = userRepository.findById(studentId);
        
        if (studentOpt.isEmpty()) {
            return ApiResponse.error("Student not found");
        }
        
        User student = studentOpt.get();
        student.setFlagged(true);
        student.setFlagReason(reason);
        student.setFlaggedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(student);
        return ApiResponse.success("Student flagged", UserDTO.fromEntity(savedUser));
    }
    
    public ApiResponse<UserDTO> unflagStudent(Long studentId) {
        Optional<User> studentOpt = userRepository.findById(studentId);
        
        if (studentOpt.isEmpty()) {
            return ApiResponse.error("Student not found");
        }
        
        User student = studentOpt.get();
        student.setFlagged(false);
        student.setFlagReason(null);
        student.setFlaggedAt(null);
        
        User savedUser = userRepository.save(student);
        return ApiResponse.success("Student unflagged", UserDTO.fromEntity(savedUser));
    }
    
    public ApiResponse<Void> deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return ApiResponse.error("User not found");
        }
        
        userRepository.deleteById(id);
        return ApiResponse.success("User deleted", null);
    }
    
    public long getCountByRole(String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            return userRepository.countByRole(userRole);
        } catch (IllegalArgumentException e) {
            return 0;
        }
    }
    
    public ApiResponse<UserDTO> createUser(UserDTO userDTO, String password) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            return ApiResponse.error("Email already registered");
        }
        
        if (userDTO.getUsername() != null && userRepository.existsByUsername(userDTO.getUsername())) {
            return ApiResponse.error("Username already taken");
        }
        
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        String salt = Base64.getEncoder().encodeToString(saltBytes);
        
        String hashedPassword;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hashed = md.digest(password.getBytes(StandardCharsets.UTF_8));
            hashedPassword = Base64.getEncoder().encodeToString(hashed);
        } catch (Exception e) {
            return ApiResponse.error("Error creating user");
        }
        
        User.Role role;
        try {
            role = User.Role.valueOf(userDTO.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            role = User.Role.STUDENT;
        }
        
        User user = new User();
        user.setName(userDTO.getName());
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(hashedPassword);
        user.setPasswordSalt(salt);
        user.setRole(role);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setSpecialization(userDTO.getSpecialization());
        user.setEvaluatorType(userDTO.getEvaluatorType());
        
        User savedUser = userRepository.save(user);
        return ApiResponse.success("User created", UserDTO.fromEntity(savedUser));
    }
}
