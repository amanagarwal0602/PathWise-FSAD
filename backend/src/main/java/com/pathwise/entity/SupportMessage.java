package com.pathwise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_messages")
public class SupportMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long conversationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FromRole fromRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "sent_at", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime timestamp;

    public enum FromRole {
        USER,
        ADMIN
    }

    public SupportMessage() {}

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public FromRole getFromRole() { return fromRole; }
    public void setFromRole(FromRole fromRole) { this.fromRole = fromRole; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
