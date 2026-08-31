package com.arcade.backend.payment.repository;

import com.arcade.backend.payment.model.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, UUID> {
    List<CreditTransaction> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
