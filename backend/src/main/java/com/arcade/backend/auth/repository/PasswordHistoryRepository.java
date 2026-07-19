package com.arcade.backend.auth.repository;

import com.arcade.backend.auth.entity.PasswordHistory;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, UUID> {
    List<PasswordHistory> findTop5ByUserIdOrderByCreatedAtDesc(UUID userId);
}
