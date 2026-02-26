package com.pathwise.service;

import com.pathwise.entity.ChatMessage;
import com.pathwise.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {
    
    private final ChatMessageRepository chatMessageRepository;
    
    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }
    
    public List<ChatMessage> getConversation(Long userId, Long otherUserId) {
        return chatMessageRepository.findConversation(userId, otherUserId);
    }
    
    public ChatMessage sendMessage(Long senderId, Long receiverId, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSenderId(senderId);
        chatMessage.setReceiverId(receiverId);
        chatMessage.setMessage(message);
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setIsRead(false);
        
        return chatMessageRepository.save(chatMessage);
    }
    
    public List<ChatMessage> getUnreadMessages(Long userId) {
        return chatMessageRepository.findByReceiverIdAndIsReadFalse(userId);
    }
    
    public long getUnreadCount(Long userId) {
        return chatMessageRepository.countByReceiverIdAndIsReadFalse(userId);
    }
    
    public void markAsRead(Long messageId) {
        chatMessageRepository.findById(messageId).ifPresent(message -> {
            message.setIsRead(true);
            chatMessageRepository.save(message);
        });
    }
    
    public void markConversationAsRead(Long userId, Long otherUserId) {
        List<ChatMessage> messages = chatMessageRepository.findConversation(userId, otherUserId);
        for (ChatMessage message : messages) {
            if (message.getReceiverId().equals(userId) && !message.getIsRead()) {
                message.setIsRead(true);
                chatMessageRepository.save(message);
            }
        }
    }
    
    public List<Long> getChatParticipants(Long userId) {
        return chatMessageRepository.findAllChatParticipants(userId);
    }
}
