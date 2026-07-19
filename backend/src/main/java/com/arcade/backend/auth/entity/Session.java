package com.arcade.backend.auth.entity;

import com.arcade.backend.user.User;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "refresh_token_family_id", nullable = false)
    private UUID refreshTokenFamilyId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(length = 255)
    private String device;

    @Column(length = 255)
    private String browser;

    @Column(name = "operating_system", length = 100)
    private String operatingSystem;

    @Column(length = 100)
    private String country;

    @Column(name = "login_time")
    private ZonedDateTime loginTime;

    @Column(name = "last_activity")
    private ZonedDateTime lastActivity;

    @Column(name = "websocket_connection_id", length = 255)
    private String websocketConnectionId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
