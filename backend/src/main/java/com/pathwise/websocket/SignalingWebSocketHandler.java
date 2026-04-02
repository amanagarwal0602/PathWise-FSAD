package com.pathwise.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalingWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // roomId -> sessions in that room
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JsonNode json = objectMapper.readTree(payload);
        JsonNode roomNode = json.get("roomId");
        if (roomNode == null || roomNode.asText().isEmpty()) {
            return; // ignore malformed messages
        }
        String roomId = roomNode.asText();

        // Register session with this room
        rooms.computeIfAbsent(roomId, id -> ConcurrentHashMap.newKeySet()).add(session);
        session.getAttributes().putIfAbsent("roomId", roomId);

        // Broadcast signaling message to all other participants in the same room
        Set<WebSocketSession> roomSessions = rooms.get(roomId);
        if (roomSessions == null) {
            return;
        }

        for (WebSocketSession s : roomSessions) {
            if (s.isOpen() && !s.getId().equals(session.getId())) {
                try {
                    s.sendMessage(message);
                } catch (IOException ignored) {
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
        // Remove session from all rooms
        rooms.values().forEach(set -> set.remove(session));
    }
}
