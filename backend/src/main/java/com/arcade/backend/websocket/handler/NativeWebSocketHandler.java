package com.arcade.backend.websocket.handler;

import com.arcade.backend.websocket.service.WebSocketSessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
@Slf4j
public class NativeWebSocketHandler extends TextWebSocketHandler {

    private final WebSocketSessionManager sessionManager;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = (String) session.getAttributes().get("username");
        if (username != null) {
            sessionManager.addSession(username, session);
            
            // Send AUTH_SUCCESS event back to client
            sessionManager.sendEventToUser(username, "AUTH_SUCCESS", "Successfully connected to native WebSocket");
        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String username = (String) session.getAttributes().get("username");
        log.debug("Received message from {}: {}", username, message.getPayload());
        
        // Handle incoming messages if needed, e.g. Heartbeats or signaling
        if ("PING".equalsIgnoreCase(message.getPayload())) {
            session.sendMessage(new TextMessage("PONG"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = (String) session.getAttributes().get("username");
        if (username != null) {
            sessionManager.removeSession(username);
        }
    }
}
