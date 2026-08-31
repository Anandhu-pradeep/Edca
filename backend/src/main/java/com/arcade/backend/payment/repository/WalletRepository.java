package com.arcade.backend.payment.repository;

import com.arcade.backend.payment.model.Wallet;
import com.arcade.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByUser(User user);
    Optional<Wallet> findByUserId(UUID userId);
}
