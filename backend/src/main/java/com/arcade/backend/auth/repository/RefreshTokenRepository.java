package com.arcade.backend.auth.repository;

import com.arcade.backend.auth.entity.RefreshToken;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    List<RefreshToken> findAllByFamilyId(UUID familyId);
    List<RefreshToken> findAllByUserIdAndIsRevokedFalse(UUID userId);
}
