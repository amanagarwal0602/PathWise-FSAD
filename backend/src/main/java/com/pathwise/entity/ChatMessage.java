package com.pathwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long senderId;
    
    @Column(nullable = false)
    private Long receiverId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "sent_at", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime timestamp;
    
    private Boolean isRead = false;
    
    public ChatMessage() {}
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
}
