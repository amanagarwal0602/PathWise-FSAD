package com.pathwise.service;

import com.pathwise.entity.SupportConversation;
import com.pathwise.entity.SupportMessage;
import com.pathwise.repository.SupportConversationRepository;
import com.pathwise.repository.SupportMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SupportService {

    private final SupportConversationRepository conversationRepository;
    private final SupportMessageRepository messageRepository;

    public SupportService(SupportConversationRepository conversationRepository,
                          SupportMessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public SupportConversation addVisitorMessage(Long userId, String sessionId, String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Message text cannot be empty");
        }

        SupportConversation conversation = null;

        if (userId != null) {
            conversation = conversationRepository
                .findFirstByUserIdAndStatusOrderByLastUpdatedAtDesc(userId, SupportConversation.Status.OPEN)
                .orElse(null);
        }

        if (conversation == null && sessionId != null && !sessionId.isBlank()) {
            conversation = conversationRepository
                .findFirstBySessionIdAndStatusOrderByLastUpdatedAtDesc(sessionId, SupportConversation.Status.OPEN)
                .orElse(null);
        }

        LocalDateTime now = LocalDateTime.now();

        if (conversation == null) {
            conversation = new SupportConversation();
            conversation.setUserId(userId);
            conversation.setSessionId(sessionId);
            conversation.setStatus(SupportConversation.Status.OPEN);
            conversation.setCreatedAt(now);
            conversation.setLastUpdatedAt(now);
        } else {
            conversation.setLastUpdatedAt(now);
            if (conversation.getUserId() == null && userId != null) {
                conversation.setUserId(userId);
            }
        }

        SupportConversation savedConversation = conversationRepository.save(conversation);

        SupportMessage message = new SupportMessage();
        message.setConversationId(savedConversation.getId());
        message.setFromRole(SupportMessage.FromRole.USER);
        message.setText(text.trim());
        message.setTimestamp(now);
        messageRepository.save(message);

        return savedConversation;
    }

    @Transactional
    public SupportConversation addAdminReply(Long conversationId, String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Message text cannot be empty");
        }

        SupportConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        LocalDateTime now = LocalDateTime.now();

        SupportMessage message = new SupportMessage();
        message.setConversationId(conversation.getId());
        message.setFromRole(SupportMessage.FromRole.ADMIN);
        message.setText(text.trim());
        message.setTimestamp(now);
        messageRepository.save(message);

        conversation.setLastUpdatedAt(now);
        return conversationRepository.save(conversation);
    }

    @Transactional(readOnly = true)
    public List<SupportConversation> getAllConversations() {
        return new ArrayList<>(conversationRepository.findAllByOrderByLastUpdatedAtDesc());
    }

    @Transactional(readOnly = true)
    public List<SupportConversation> getUserConversations(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return new ArrayList<>(conversationRepository.findByUserIdOrderByLastUpdatedAtDesc(userId));
    }

    @Transactional(readOnly = true)
    public List<SupportMessage> getConversationMessages(Long conversationId) {
        return new ArrayList<>(messageRepository.findByConversationIdOrderByTimestampAsc(conversationId));
    }

    @Transactional
    public SupportConversation closeConversation(Long conversationId) {
        SupportConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (conversation.getStatus() != SupportConversation.Status.CLOSED) {
            conversation.setStatus(SupportConversation.Status.CLOSED);
            conversation.setClosedAt(LocalDateTime.now());
        }

        return conversationRepository.save(conversation);
    }
}
