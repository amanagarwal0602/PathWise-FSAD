package com.pathwise.repository;

import com.pathwise.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    List<Resource> findByIsPublicTrue();
    
    List<Resource> findByCategory(String category);
    
    List<Resource> findByType(String type);
    
    List<Resource> findByUploadedBy(Long userId);
    
    List<Resource> findByCategoryAndIsPublicTrue(String category);
}
