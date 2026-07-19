package com.arcade.backend.websocket.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WebRTCService {

    @Value("${application.security.webrtc.secret-key}")
    private String rtcSecretKey;

    // 5 minutes expiration for interview join tokens
    private static final long JOIN_TOKEN_EXPIRATION = 5 * 60 * 1000;

    public String generateInterviewJoinToken(String userEmail, UUID interviewId) {
        return Jwts.builder()
                .subject(userEmail)
                .claim("interviewId", interviewId.toString())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + JOIN_TOKEN_EXPIRATION))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public boolean validateInterviewJoinToken(String token, UUID expectedInterviewId) {
        try {
            String tokenInterviewId = Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("interviewId", String.class);
            
            return expectedInterviewId.toString().equals(tokenInterviewId);
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(rtcSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
