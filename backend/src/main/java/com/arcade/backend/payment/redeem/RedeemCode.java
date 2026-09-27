package com.arcade.backend.payment.redeem;

import com.arcade.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "redeem_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedeemCode extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code_hash", nullable = false, unique = true)
    private String codeHash;

    @Column(nullable = false)
    private Long credits;

    @Column(name = "expires_at")
    private ZonedDateTime expiresAt;

    @Column(name = "max_redemptions")
    private Integer maxRedemptions;

    @Column(name = "redemption_count", nullable = false)
    @Builder.Default
    private Integer redemptionCount = 0;

    @Column(name = "per_user_limit", nullable = false)
    @Builder.Default
    private Integer perUserLimit = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RedeemCodeStatus status;

    @Column(name = "created_by")
    private UUID createdBy;
}
