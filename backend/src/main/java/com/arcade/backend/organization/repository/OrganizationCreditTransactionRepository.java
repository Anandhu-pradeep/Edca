package com.arcade.backend.organization.repository;

import com.arcade.backend.organization.entity.OrganizationCreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationCreditTransactionRepository extends JpaRepository<OrganizationCreditTransaction, UUID> {
    List<OrganizationCreditTransaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId);
}
