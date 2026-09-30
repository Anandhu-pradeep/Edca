package com.arcade.backend.organization.entity;

import com.arcade.backend.common.entity.BaseEntity;
import com.arcade.backend.organization.enums.OrgRoleType;
import com.arcade.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "organization_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrgRoleType role = OrgRoleType.STUDENT;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
