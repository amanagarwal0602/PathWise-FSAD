package com.pathwise.controller;

import com.pathwise.entity.SupportConversation;
import com.pathwise.entity.SupportMessage;
import com.pathwise.service.SupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @PostMapping("/visitor")
    public ResponseEntity<Map<String, Object>> addVisitorMessage(@RequestBody Map<String, Object> body) {
        Long userId = null;
        if (body.get("userId") != null) {
            userId = Long.parseLong(body.get("userId").toString());
        }
        String sessionId = body.get("sessionId") != null ? body.get("sessionId").toString() : null;
        String text = body.get("text") != null ? body.get("text").toString() : null;

        SupportConversation conv = supportService.addVisitorMessage(userId, sessionId, text);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conv.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/{conversationId}/reply")
    public ResponseEntity<Void> addAdminReply(@PathVariable Long conversationId,
                                              @RequestBody Map<String, Object> body) {
        String text = body.get("text") != null ? body.get("text").toString() : null;
        supportService.addAdminReply(conversationId, text);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<SupportConversation>> getAllConversations() {
        return ResponseEntity.ok(supportService.getAllConversations());
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<SupportMessage>> getConversationMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(supportService.getConversationMessages(conversationId));
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<Void> closeConversation(@PathVariable Long conversationId) {
        supportService.closeConversation(conversationId);
        return ResponseEntity.ok().build();
    }
}
