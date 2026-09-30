package com.arcade.backend.organization.entity;

import com.arcade.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "org_classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrgClass extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "academic_year", length = 50)
    private String academicYear;
}
