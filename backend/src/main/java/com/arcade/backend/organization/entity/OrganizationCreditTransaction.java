package com.arcade.backend.organization.entity;

import com.arcade.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "organization_credit_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationCreditTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private OrganizationCreditWallet wallet;

    @Column(nullable = false)
    private int amount;

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType; // e.g., PURCHASE, RESERVED, CONSUMED, REFUNDED

    @Column(length = 255)
    private String description;

    @Column(name = "reference_id")
    private UUID referenceId; // could refer to an Interview Assignment ID
}
