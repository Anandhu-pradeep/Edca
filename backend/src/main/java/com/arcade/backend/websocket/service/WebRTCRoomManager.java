package com.arcade.backend.websocket.service;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WebRTCRoomManager {

  // roomId -> set of usernames
  private final Map<String, Set<String>> rooms = new ConcurrentHashMap<>();
  // username -> roomId
  private final Map<String, String> userRooms = new ConcurrentHashMap<>();

  private static final int MAX_PARTICIPANTS = 4;

  public boolean createRoom(String roomId, String username) {
    if (rooms.containsKey(roomId)) {
      return false; // Room already exists
    }
    Set<String> participants = ConcurrentHashMap.newKeySet();
    participants.add(username);
    rooms.put(roomId, participants);
    userRooms.put(username, roomId);
    log.info("User {} created room {}. Participants: {}", username, roomId, participants);
    return true;
  }

  public boolean joinRoom(String roomId, String username) {
    if (!rooms.containsKey(roomId)) {
      log.warn("User {} failed to join room {}, room does not exist.", username, roomId);
      return false; // Room doesn't exist
    }
    Set<String> participants = rooms.get(roomId);
    if (participants.size() >= MAX_PARTICIPANTS && !participants.contains(username)) {
      log.warn("User {} failed to join room {}, room is full.", username, roomId);
      return false; // Room is full
    }
    participants.add(username);
    userRooms.put(username, roomId);
    log.info("User {} joined room {}. Participants: {}", username, roomId, participants);
    return true;
  }

  public String leaveRoom(String username) {
    String roomId = userRooms.remove(username);
    if (roomId != null) {
      Set<String> participants = rooms.get(roomId);
      if (participants != null) {
        participants.remove(username);
        log.info("User {} left room {}. Participants remaining: {}", username, roomId, participants);
        if (participants.isEmpty()) {
          rooms.remove(roomId);
          log.info("Room {} destroyed because it is empty.", roomId);
        }
      }
    }
    return roomId;
  }

  public Set<String> getParticipants(String roomId) {
    return rooms.getOrDefault(roomId, Collections.emptySet());
  }

  public String getRoomForUser(String username) {
    return userRooms.get(username);
  }
}
