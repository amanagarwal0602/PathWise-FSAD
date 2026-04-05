package com.pathwise.service;

import com.pathwise.dto.*;
import com.pathwise.entity.User;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.JwtUtil;
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
    private final JwtUtil jwtUtil;
    
    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }
    
    // Master password constant (used for emergency access and password changes)
    public static final String MASTER_PASSWORD = "1234";
    
    public LoginResponse login(LoginRequest request) {
        // Normal login
        Optional<User> userOpt = userRepository.findByEmailOrUsername(
            request.getIdentifier(), request.getIdentifier()
        );
        
        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "User not found", null, null);
        }
        
        User user = userOpt.get();
        
        // Check master password first (demo / emergency access)
        boolean isMasterPassword = MASTER_PASSWORD.equals(request.getPassword());

        // Verify user password (with support for legacy plain-text accounts)
        boolean passwordValid = false;

        if (user.getPasswordSalt() == null || user.getPasswordSalt().isEmpty()
                || user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            // Legacy users created before hashing: passwordHash stores plain text.
            // Allow login if the raw password matches and transparently upgrade
            // them to a salted+hashed password for future logins.
            String stored = user.getPasswordHash();
            if (stored != null && stored.equals(request.getPassword())) {
                passwordValid = true;

                String newSalt = generateSalt();
                String newHash = hashPassword(request.getPassword(), newSalt);
                user.setPasswordSalt(newSalt);
                user.setPasswordHash(newHash);
                userRepository.save(user);
            }
        } else {
            String hashedPassword = hashPassword(request.getPassword(), user.getPasswordSalt());
            if (hashedPassword.equals(user.getPasswordHash())) {
                passwordValid = true;
            }
        }

        if (!isMasterPassword && !passwordValid) {
            return new LoginResponse(false, "Invalid password", null, null);
        }

        // Check status (master password bypasses status checks for demo)
        if (!isMasterPassword) {
            if (user.getStatus() == User.UserStatus.PENDING_VERIFICATION) {
                return new LoginResponse(false, "Account pending verification", null, null);
            }
            
            if (user.getStatus() == User.UserStatus.REJECTED) {
                return new LoginResponse(false, "Account has been rejected", null, null);
            }
        }
        
        return new LoginResponse(true, "Login successful", 
            UserDTO.fromEntity(user), generateRealToken(user));
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
        
        // Both students and counsellors need verification now
        status = User.UserStatus.PENDING_VERIFICATION;
        
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
    
    private String generateRealToken(User user) {
        return jwtUtil.generateToken(user.getUsername() != null ? user.getUsername() : user.getEmail(), user.getRole().name(), user.getId());
    }
}
