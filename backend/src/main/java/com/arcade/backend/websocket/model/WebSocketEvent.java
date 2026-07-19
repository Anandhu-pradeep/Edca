package com.arcade.backend.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketEvent<T> {
    private String type; // e.g. AUTH_SUCCESS, SESSION_EXPIRED, NEW_DEVICE_LOGIN
    private T payload;
    private long timestamp;
}
