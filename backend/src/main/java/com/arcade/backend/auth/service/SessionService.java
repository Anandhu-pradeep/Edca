package com.arcade.backend.auth.service;

import com.arcade.backend.auth.entity.Session;
import com.arcade.backend.auth.repository.SessionRepository;
import com.arcade.backend.user.User;
import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    @Transactional
    public Session createSession(User user, UUID refreshTokenFamilyId, String ipAddress, String userAgentHeader) {
        
        // Parse User Agent here in a real app, simplified for now
        String browser = "Unknown";
        String os = "Unknown";
        String device = "Unknown";
        
        if (userAgentHeader != null) {
            if (userAgentHeader.contains("Chrome")) browser = "Chrome";
            else if (userAgentHeader.contains("Firefox")) browser = "Firefox";
            else if (userAgentHeader.contains("Safari")) browser = "Safari";
            
            if (userAgentHeader.contains("Windows")) os = "Windows";
            else if (userAgentHeader.contains("Mac OS X")) os = "MacOS";
            else if (userAgentHeader.contains("Linux")) os = "Linux";
            else if (userAgentHeader.contains("Android")) { os = "Android"; device = "Mobile"; }
            else if (userAgentHeader.contains("iPhone")) { os = "iOS"; device = "Mobile"; }
        }

        Session session = Session.builder()
                .user(user)
                .refreshTokenFamilyId(refreshTokenFamilyId)
                .ipAddress(ipAddress)
                .browser(browser)
                .operatingSystem(os)
                .device(device)
                .country("Unknown") // Would use GeoIP lookup here
                .loginTime(ZonedDateTime.now())
                .lastActivity(ZonedDateTime.now())
                .isActive(true)
                .build();

        return sessionRepository.save(session);
    }
}
