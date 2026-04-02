package com.pathwise.repository;

import com.pathwise.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {

    List<SupportMessage> findByConversationIdOrderByTimestampAsc(Long conversationId);
}
