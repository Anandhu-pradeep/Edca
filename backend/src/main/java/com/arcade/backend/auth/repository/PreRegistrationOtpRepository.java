package com.arcade.backend.auth.repository;

import com.arcade.backend.auth.entity.PreRegistrationOtp;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PreRegistrationOtpRepository extends JpaRepository<PreRegistrationOtp, UUID> {
    Optional<PreRegistrationOtp> findByEmail(String email);
}
