package com.arcade.backend.websocket.handler;

import com.arcade.backend.websocket.service.WebSocketSessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.arcade.backend.websocket.service.WebRTCRoomManager;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class NativeWebSocketHandler extends TextWebSocketHandler {

  private final WebSocketSessionManager sessionManager;
  private final WebRTCRoomManager roomManager;
  private final ObjectMapper objectMapper;

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    String username = (String) session.getAttributes().get("username");
    if (username != null) {
      sessionManager.addSession(username, session);

      // Send AUTH_SUCCESS event back to client
      sessionManager.sendEventToUser(
          username, "AUTH_SUCCESS", "Successfully connected to native WebSocket");
    } else {
      session.close(CloseStatus.NOT_ACCEPTABLE);
    }
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    String username = (String) session.getAttributes().get("username");
    String payload = message.getPayload();
    log.debug("Received message from {}: {}", username, payload);

    if ("PING".equalsIgnoreCase(payload)) {
      session.sendMessage(new TextMessage("PONG"));
      return;
    }

    try {
      JsonNode node = objectMapper.readTree(payload);
      String type = node.has("type") ? node.get("type").asText() : "";

      if ("create-room".equals(type)) {
        String roomId = node.get("roomId").asText();
        boolean created = roomManager.createRoom(roomId, username);
        if (!created) {
          // Room already exists. Instead of failing, just try to join it!
          boolean joined = roomManager.joinRoom(roomId, username);
          if (!joined) {
            sessionManager.sendEventToUser(username, "room-full", null);
            return;
          }
        }
        
        Set<String> participants = roomManager.getParticipants(roomId);
        
        // Notify others in the room (in case they joined instead of created)
        if (!created) {
          for (String peer : participants) {
            if (!peer.equals(username)) {
              sessionManager.sendEventToUser(peer, "user-joined", Map.of("username", username));
            }
          }
        }
        
        sessionManager.sendEventToUser(username, "room-joined", Map.of("participants", participants));
        
      } else if ("join-room".equals(type)) {
        String roomId = node.get("roomId").asText();
        boolean joined = roomManager.joinRoom(roomId, username);
        
        if (!joined) {
          // If room doesn't exist yet (e.g. pre-assigned interview session), auto-create and join it
          boolean created = roomManager.createRoom(roomId, username);
          if (!created) {
            // Still couldn't join or create (e.g. room is full)
            sessionManager.sendEventToUser(username, "room-not-found", null);
            return;
          }
        }
        
        Set<String> participants = roomManager.getParticipants(roomId);
        
        // Notify others in the room
        for (String peer : participants) {
          if (!peer.equals(username)) {
            sessionManager.sendEventToUser(peer, "user-joined", Map.of("username", username));
          }
        }
        
        // Send room state back to the joiner
        sessionManager.sendEventToUser(username, "room-joined", Map.of("participants", participants));
        
      } else if (Set.of("offer", "answer", "ice-candidate").contains(type)) {
        String targetUsername = node.has("target") ? node.get("target").asText() : null;
        if (targetUsername != null) {
          sessionManager.sendEventToUser(targetUsername, type, Map.of(
              "sender", username,
              "data", node.get("data")
          ));
        }
        
      } else if ("video-toggle".equals(type)) {
        String roomId = node.has("roomId") ? node.get("roomId").asText() : null;
        boolean isCameraOn = node.has("isCameraOn") && node.get("isCameraOn").asBoolean();
        if (roomId != null) {
          Set<String> participants = roomManager.getParticipants(roomId);
          for (String peer : participants) {
            if (!peer.equals(username)) {
              sessionManager.sendEventToUser(peer, "video-toggle", Map.of(
                  "username", username,
                  "isCameraOn", isCameraOn
              ));
            }
          }
        }

      } else if ("audio-toggle".equals(type)) {
        String roomId = node.has("roomId") ? node.get("roomId").asText() : null;
        boolean isMicOn = node.has("isMicOn") && node.get("isMicOn").asBoolean();
        if (roomId != null) {
          Set<String> participants = roomManager.getParticipants(roomId);
          for (String peer : participants) {
            if (!peer.equals(username)) {
              sessionManager.sendEventToUser(peer, "audio-toggle", Map.of(
                  "username", username,
                  "isMicOn", isMicOn
              ));
            }
          }
        }

      } else if ("leave-room".equals(type)) {
        handleUserLeave(username);
      }
    } catch (Exception e) {
      log.error("Failed to parse or process WebRTC signaling message from {}", username, e);
    }
  }

  private void handleUserLeave(String username) {
    String roomId = roomManager.leaveRoom(username);
    if (roomId != null) {
      Set<String> participants = roomManager.getParticipants(roomId);
      for (String peer : participants) {
        sessionManager.sendEventToUser(peer, "user-left", Map.of("username", username));
      }
    }
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    String username = (String) session.getAttributes().get("username");
    if (username != null) {
      handleUserLeave(username);
      sessionManager.removeSession(username);
    }
  }
}
