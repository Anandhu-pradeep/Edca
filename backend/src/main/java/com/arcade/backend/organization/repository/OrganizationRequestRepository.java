package com.arcade.backend.organization.repository;

import com.arcade.backend.organization.entity.OrganizationRequest;
import com.arcade.backend.organization.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationRequestRepository extends JpaRepository<OrganizationRequest, UUID> {
    List<OrganizationRequest> findByRequesterId(UUID requesterId);
    List<OrganizationRequest> findByStatus(RequestStatus status);
    boolean existsByRequesterIdAndStatus(UUID requesterId, RequestStatus status);
}
