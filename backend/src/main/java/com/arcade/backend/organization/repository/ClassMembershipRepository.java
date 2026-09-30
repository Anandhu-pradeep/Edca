package com.arcade.backend.organization.repository;

import com.arcade.backend.organization.entity.ClassMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassMembershipRepository extends JpaRepository<ClassMembership, UUID> {
    List<ClassMembership> findByOrgClassId(UUID orgClassId);
    List<ClassMembership> findByUserId(UUID userId);
    boolean existsByOrgClassIdAndUserId(UUID orgClassId, UUID userId);
}
