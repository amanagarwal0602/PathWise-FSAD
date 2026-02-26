package com.pathwise.repository;

import com.pathwise.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findBySenderIdAndReceiverIdOrderByTimestampAsc(Long senderId, Long receiverId);
    
    @Query("SELECT c FROM ChatMessage c WHERE (c.senderId = :userId AND c.receiverId = :otherUserId) OR (c.senderId = :otherUserId AND c.receiverId = :userId) ORDER BY c.timestamp ASC")
    List<ChatMessage> findConversation(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);
    
    List<ChatMessage> findByReceiverIdAndIsReadFalse(Long receiverId);
    
    long countByReceiverIdAndIsReadFalse(Long receiverId);
    
    @Query("SELECT DISTINCT c.senderId FROM ChatMessage c WHERE c.receiverId = :userId")
    List<Long> findUniqueSendersByReceiverId(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT CASE WHEN c.senderId = :userId THEN c.receiverId ELSE c.senderId END FROM ChatMessage c WHERE c.senderId = :userId OR c.receiverId = :userId")
    List<Long> findAllChatParticipants(@Param("userId") Long userId);
}
