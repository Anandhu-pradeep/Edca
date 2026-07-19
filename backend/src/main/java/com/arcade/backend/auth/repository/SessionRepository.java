package com.arcade.backend.auth.repository;

import com.arcade.backend.auth.entity.Session;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findAllByUserIdAndIsActiveTrue(UUID userId);
    List<Session> findAllByRefreshTokenFamilyId(UUID refreshTokenFamilyId);
    Optional<Session> findByWebsocketConnectionId(String websocketConnectionId);
}
