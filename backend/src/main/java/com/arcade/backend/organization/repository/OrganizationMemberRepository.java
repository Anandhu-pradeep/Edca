package com.arcade.backend.organization.repository;

import com.arcade.backend.organization.entity.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, UUID> {
    List<OrganizationMember> findByOrganizationId(UUID organizationId);
    List<OrganizationMember> findByUserId(UUID userId);
    boolean existsByOrganizationIdAndUserId(UUID organizationId, UUID userId);
    java.util.Optional<OrganizationMember> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);
}
