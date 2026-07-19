package com.arcade.backend.websocket.config;

import com.arcade.backend.security.jwt.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest req = servletRequest.getServletRequest();
            String authHeader = req.getHeader("Authorization");
            
            // Also allow passing token via query param for clients that can't set headers in native WebSocket
            String queryToken = req.getParameter("token");
            
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            } else if (queryToken != null) {
                token = queryToken;
            }

            if (token != null) {
                try {
                    String username = jwtService.extractUsername(token);
                    // In a full implementation we might validate the token fully here with UserDetailsService
                    // For now, if extractUsername doesn't throw, the signature is valid and it's not expired
                    if (username != null) {
                        attributes.put("username", username);
                        return true;
                    }
                } catch (Exception e) {
                    log.error("WebSocket Handshake failed due to invalid JWT: {}", e.getMessage());
                    return false;
                }
            }
        }
        log.warn("WebSocket Handshake blocked: Missing or invalid token");
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        // No-op
    }
}
