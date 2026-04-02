package com.pathwise.repository;

import com.pathwise.entity.SupportConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportConversationRepository extends JpaRepository<SupportConversation, Long> {

    Optional<SupportConversation> findFirstByUserIdAndStatusOrderByLastUpdatedAtDesc(Long userId, SupportConversation.Status status);

    Optional<SupportConversation> findFirstBySessionIdAndStatusOrderByLastUpdatedAtDesc(String sessionId, SupportConversation.Status status);

    List<SupportConversation> findByUserIdOrderByLastUpdatedAtDesc(Long userId);

    List<SupportConversation> findAllByOrderByLastUpdatedAtDesc();
}
