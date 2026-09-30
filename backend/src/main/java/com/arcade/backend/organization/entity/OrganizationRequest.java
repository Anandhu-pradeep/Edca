package com.arcade.backend.organization.entity;

import com.arcade.backend.common.entity.BaseEntity;
import com.arcade.backend.organization.enums.RequestStatus;
import com.arcade.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "organization_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "org_name", nullable = false, length = 255)
    private String orgName;

    @Column(name = "org_type", length = 100)
    private String orgType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "official_email", length = 255)
    private String officialEmail;

    @Column(name = "email_domain", length = 255)
    private String emailDomain;
    
    @Column(name = "expected_students")
    private Integer expectedStudents;

    @Column(name = "contact_info", columnDefinition = "TEXT")
    private String contactInfo;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "supporting_info", columnDefinition = "TEXT")
    private String supportingInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;
}
