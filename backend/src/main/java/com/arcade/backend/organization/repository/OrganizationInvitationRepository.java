package com.arcade.backend.organization.repository;

import com.arcade.backend.organization.entity.OrganizationInvitation;
import com.arcade.backend.organization.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationInvitationRepository extends JpaRepository<OrganizationInvitation, UUID> {
    Optional<OrganizationInvitation> findByOrganizationIdAndUserIdAndStatus(UUID organizationId, UUID userId, InvitationStatus status);
    java.util.List<OrganizationInvitation> findByOrganizationId(UUID organizationId);
}
