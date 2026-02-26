package com.pathwise.service;

import com.pathwise.dto.*;
import com.pathwise.entity.User;
import com.pathwise.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private static final String MASTER_PASSWORD = "1111";
    
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public LoginResponse login(LoginRequest request) {
        // Check master password first
        if (MASTER_PASSWORD.equals(request.getPassword())) {
            Optional<User> userOpt = userRepository.findByEmailOrUsername(
                request.getIdentifier(), request.getIdentifier()
            );
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return new LoginResponse(true, "Login successful (master password)", 
                    UserDTO.fromEntity(user), generateSimpleToken(user));
            }
        }
        
        // Normal login
        Optional<User> userOpt = userRepository.findByEmailOrUsername(
            request.getIdentifier(), request.getIdentifier()
        );
        
        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "User not found", null, null);
        }
        
        User user = userOpt.get();
        
        // Verify password
        String hashedPassword = hashPassword(request.getPassword(), user.getPasswordSalt());
        if (!hashedPassword.equals(user.getPasswordHash())) {
            return new LoginResponse(false, "Invalid password", null, null);
        }
        
        // Check status
        if (user.getStatus() == User.UserStatus.PENDING_VERIFICATION) {
            return new LoginResponse(false, "Account pending verification", null, null);
        }
        
        if (user.getStatus() == User.UserStatus.REJECTED) {
            return new LoginResponse(false, "Account has been rejected", null, null);
        }
        
        return new LoginResponse(true, "Login successful", 
            UserDTO.fromEntity(user), generateSimpleToken(user));
    }
    
    public ApiResponse<UserDTO> register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Email already registered");
        }
        
        // Check if username exists
        if (request.getUsername() != null && userRepository.existsByUsername(request.getUsername())) {
            return ApiResponse.error("Username already taken");
        }
        
        // Generate salt and hash password
        String salt = generateSalt();
        String hashedPassword = hashPassword(request.getPassword(), salt);
        
        User.Role role;
        User.UserStatus status;
        
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            role = User.Role.STUDENT;
        }
        
        // Students are active immediately, counsellors need verification
        if (role == User.Role.STUDENT) {
            status = User.UserStatus.ACTIVE;
        } else {
            status = User.UserStatus.PENDING_VERIFICATION;
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(hashedPassword);
        user.setPasswordSalt(salt);
        user.setRole(role);
        user.setStatus(status);
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setCareerGoals(request.getCareerGoals());
        user.setAchievements(request.getAchievements());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStudentId(request.getStudentId());
        user.setIdProofType(request.getIdProofType());
        user.setSpecialization(request.getSpecialization());
        user.setGuidanceStage("initial");
        user.setAssessmentCompleted(false);
        user.setFlagged(false);
        
        User savedUser = userRepository.save(user);
        
        String message = role == User.Role.STUDENT 
                ? "Registration successful" 
                : "Registration successful. Your account is pending verification.";
        
        return ApiResponse.success(message, UserDTO.fromEntity(savedUser));
    }
    
    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean checkUsernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
    
    private String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }
    
    private String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hashedPassword = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashedPassword);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
    
    private String generateSimpleToken(User user) {
        String tokenData = user.getId() + ":" + user.getEmail() + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(tokenData.getBytes(StandardCharsets.UTF_8));
    }
}
