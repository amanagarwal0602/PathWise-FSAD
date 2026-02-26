package com.pathwise.repository;

import com.pathwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmailOrUsername(String email, String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByStatus(User.UserStatus status);
    
    List<User> findByRoleAndStatus(User.Role role, User.UserStatus status);
    
    List<User> findByAssignedCounsellor(Long counsellorId);
    
    List<User> findByFlaggedTrue();
    
    long countByRole(User.Role role);
    
    long countByRoleAndStatus(User.Role role, User.UserStatus status);
}
