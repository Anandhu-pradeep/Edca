package com.arcade.backend.organization.repository;

import com.arcade.backend.organization.entity.OrganizationCreditWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationCreditWalletRepository extends JpaRepository<OrganizationCreditWallet, UUID> {
    Optional<OrganizationCreditWallet> findByOrganizationId(UUID organizationId);
}
