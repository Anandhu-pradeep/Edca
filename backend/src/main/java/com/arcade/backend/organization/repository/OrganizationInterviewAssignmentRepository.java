package com.arcade.backend.organization.repository;

import com.arcade.backend.organization.entity.OrganizationInterviewAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationInterviewAssignmentRepository extends JpaRepository<OrganizationInterviewAssignment, UUID> {
    List<OrganizationInterviewAssignment> findByOrganizationId(UUID organizationId);
    List<OrganizationInterviewAssignment> findByOrgClassId(UUID orgClassId);
}
