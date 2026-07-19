package com.arcade.backend.websocket.service;

import com.arcade.backend.websocket.model.WebSocketEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketSessionManager {

    // Maps a user email to their active WebSocketSession
    // In a multi-device scenario, this could map to a List<WebSocketSession> or map by sessionId
    private final Map<String, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public void addSession(String username, WebSocketSession session) {
        activeSessions.put(username, session);
        log.info("WebSocket session added for user: {}. Total sessions: {}", username, activeSessions.size());
    }

    public void removeSession(String username) {
        activeSessions.remove(username);
        log.info("WebSocket session removed for user: {}. Total sessions: {}", username, activeSessions.size());
    }

    public void disconnectUser(String username) {
        WebSocketSession session = activeSessions.remove(username);
        if (session != null && session.isOpen()) {
            try {
                session.close();
                log.info("Forcefully closed WebSocket session for user: {}", username);
            } catch (IOException e) {
                log.error("Error closing WebSocket session for user: {}", username, e);
            }
        }
    }

    public <T> void sendEventToUser(String username, String eventType, T payload) {
        WebSocketSession session = activeSessions.get(username);
        if (session != null && session.isOpen()) {
            try {
                WebSocketEvent<T> event = WebSocketEvent.<T>builder()
                        .type(eventType)
                        .payload(payload)
                        .timestamp(System.currentTimeMillis())
                        .build();
                
                String jsonEvent = objectMapper.writeValueAsString(event);
                session.sendMessage(new TextMessage(jsonEvent));
            } catch (Exception e) {
                log.error("Failed to send WebSocket event to user: {}", username, e);
            }
        }
    }
}
