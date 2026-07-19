package com.arcade.backend.websocket.config;

import com.arcade.backend.websocket.handler.NativeWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final NativeWebSocketHandler nativeWebSocketHandler;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(nativeWebSocketHandler, "/ws/v1/events")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOrigins("http://localhost:3000"); // Allowed origins in prod
    }
}
