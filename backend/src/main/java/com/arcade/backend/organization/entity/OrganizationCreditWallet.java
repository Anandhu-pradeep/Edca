package com.arcade.backend.organization.entity;

import com.arcade.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "organization_credit_wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationCreditWallet extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false, unique = true)
    private Organization organization;

    @Column(nullable = false)
    @Builder.Default
    private int balance = 0;

    @Column(name = "reserved_balance", nullable = false)
    @Builder.Default
    private int reservedBalance = 0;
}
