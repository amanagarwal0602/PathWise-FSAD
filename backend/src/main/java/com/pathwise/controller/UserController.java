package com.pathwise.controller;

import com.pathwise.dto.ApiResponse;
import com.pathwise.dto.UserDTO;
import com.pathwise.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success("User found", user)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<UserDTO>> getUsersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(userService.getUsersByStatus(status));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<UserDTO>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingVerificationUsers());
    }
    
    @GetMapping("/counsellor/{counsellorId}/students")
    public ResponseEntity<List<UserDTO>> getStudentsByCounsellor(@PathVariable Long counsellorId) {
        return ResponseEntity.ok(userService.getStudentsByCounsellor(counsellorId));
    }
    
    @GetMapping("/flagged")
    public ResponseEntity<List<UserDTO>> getFlaggedStudents() {
        return ResponseEntity.ok(userService.getFlaggedStudents());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        ApiResponse<UserDTO> response = userService.updateUser(id, userDTO);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<UserDTO>> verifyUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long verifierId = Long.parseLong(body.get("verifierId").toString());
        String notes = body.get("notes") != null ? body.get("notes").toString() : "";
        
        ApiResponse<UserDTO> response = userService.verifyUser(id, verifierId, notes);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<UserDTO>> rejectUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long verifierId = Long.parseLong(body.get("verifierId").toString());
        String reason = body.get("reason") != null ? body.get("reason").toString() : "";
        
        ApiResponse<UserDTO> response = userService.rejectUser(id, verifierId, reason);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/promote")
    public ResponseEntity<ApiResponse<UserDTO>> promoteUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        
        ApiResponse<UserDTO> response = userService.promoteUser(id, newRole);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/assign-counsellor")
    public ResponseEntity<ApiResponse<UserDTO>> assignCounsellor(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long counsellorId = Long.parseLong(body.get("counsellorId").toString());
        
        ApiResponse<UserDTO> response = userService.assignCounsellor(id, counsellorId);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/flag")
    public ResponseEntity<ApiResponse<UserDTO>> flagStudent(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        
        ApiResponse<UserDTO> response = userService.flagStudent(id, reason);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/unflag")
    public ResponseEntity<ApiResponse<UserDTO>> unflagStudent(@PathVariable Long id) {
        ApiResponse<UserDTO> response = userService.unflagStudent(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        ApiResponse<Void> response = userService.deleteUser(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/count/{role}")
    public ResponseEntity<Long> getCountByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getCountByRole(role));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@RequestBody Map<String, Object> body) {
        UserDTO userDTO = new UserDTO();
        userDTO.setName((String) body.get("name"));
        userDTO.setEmail((String) body.get("email"));
        userDTO.setUsername((String) body.get("username"));
        userDTO.setRole((String) body.get("role"));
        userDTO.setSpecialization((String) body.get("specialization"));
        userDTO.setEvaluatorType((String) body.get("evaluatorType"));
        
        String password = (String) body.get("password");
        
        ApiResponse<UserDTO> response = userService.createUser(userDTO, password);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
