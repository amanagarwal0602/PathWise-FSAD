package com.pathwise.controller;

import com.pathwise.entity.ChatMessage;
import com.pathwise.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    private final ChatService chatService;
    
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @GetMapping("/conversation/{userId}/{otherUserId}")
    public ResponseEntity<List<ChatMessage>> getConversation(
            @PathVariable Long userId, 
            @PathVariable Long otherUserId) {
        return ResponseEntity.ok(chatService.getConversation(userId, otherUserId));
    }
    
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, Object> body) {
        Long senderId = Long.parseLong(body.get("senderId").toString());
        Long receiverId = Long.parseLong(body.get("receiverId").toString());
        String message = body.get("message").toString();
        
        return ResponseEntity.ok(chatService.sendMessage(senderId, receiverId, message));
    }
    
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<ChatMessage>> getUnreadMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getUnreadMessages(userId));
    }
    
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getUnreadCount(userId));
    }
    
    @PostMapping("/mark-read/{messageId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId) {
        chatService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/mark-conversation-read/{userId}/{otherUserId}")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long userId, 
            @PathVariable Long otherUserId) {
        chatService.markConversationAsRead(userId, otherUserId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/participants/{userId}")
    public ResponseEntity<List<Long>> getChatParticipants(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getChatParticipants(userId));
    }
}
