package com.pathwise.controller;

import com.pathwise.dto.*;
import com.pathwise.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(@RequestBody RegisterRequest request) {
        ApiResponse<UserDTO> response = authService.register(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = authService.checkEmailExists(email);
        return ResponseEntity.ok(ApiResponse.success("Email check complete", exists));
    }
    
    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = authService.checkUsernameExists(username);
        return ResponseEntity.ok(ApiResponse.success("Username check complete", exists));
    }
}
